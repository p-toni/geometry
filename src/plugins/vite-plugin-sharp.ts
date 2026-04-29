import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';

const MAX_IMAGE_BYTES = 16 * 1024 * 1024; // 16 MB
const MAX_BODY_BYTES = MAX_IMAGE_BYTES + 64 * 1024;
const SPAWN_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_POINT_COUNT = 2_000_000;
const MIN_POINT_COUNT = 1024;
const MAX_POINT_COUNT = 2_000_000;
const HIGH_QUALITY_CACHE_FLOOR = 1_000_000;
const DEFAULT_FIT_RADIUS = 1.6;
const CURRENT_SPLT_VERSION = 2;
const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);
const SPLT_MAGIC = 0x544c5053; // 'SPLT' little-endian

function hostOf(value: string | undefined) {
  if (!value) return '';
  return value.split(':')[0]?.toLowerCase() ?? '';
}

function isLoopback(req: IncomingMessage) {
  const host = hostOf(req.headers.host);
  if (!ALLOWED_HOSTS.has(host)) return false;
  for (const header of [req.headers.origin, req.headers.referer]) {
    if (!header) continue;
    try {
      const headerHost = new URL(header).hostname.toLowerCase();
      if (!ALLOWED_HOSTS.has(headerHost)) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function reply(
  res: ServerResponse,
  status: number,
  body: string,
  contentType = 'text/plain; charset=utf-8',
) {
  res.statusCode = status;
  res.setHeader('Content-Type', contentType);
  res.end(body);
}

function readBody(
  req: IncomingMessage,
  limit: number,
): Promise<{ body: Buffer } | { error: string; status: number }> {
  return new Promise((resolvePromise) => {
    let size = 0;
    const chunks: Buffer[] = [];
    let aborted = false;
    req.on('data', (chunk: Buffer) => {
      if (aborted) return;
      size += chunk.length;
      if (size > limit) {
        aborted = true;
        resolvePromise({ error: 'payload too large', status: 413 });
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (aborted) return;
      resolvePromise({ body: Buffer.concat(chunks) });
    });
    req.on('error', () => {
      if (aborted) return;
      aborted = true;
      resolvePromise({ error: 'read error', status: 400 });
    });
  });
}

interface MultipartFile {
  filename?: string;
  contentType: string;
  data: Buffer;
}

interface ParsedMultipart {
  fields: Record<string, string>;
  files: Record<string, MultipartFile>;
}

// Minimal multipart/form-data parser. Handles single-part-per-field (no
// repeated names) which is all we need.
export function parseMultipart(body: Buffer, boundary: string): ParsedMultipart {
  const result: ParsedMultipart = { fields: {}, files: {} };
  const delimiter = Buffer.from(`--${boundary}`);
  const sections: Buffer[] = [];
  let cursor = 0;
  while (cursor < body.length) {
    const start = body.indexOf(delimiter, cursor);
    if (start < 0) break;
    const after = start + delimiter.length;
    if (body.slice(after, after + 2).equals(Buffer.from('--'))) break;
    const next = body.indexOf(delimiter, after);
    if (next < 0) break;
    const sectionStart = after + 2; // skip CRLF after boundary
    const sectionEnd = next - 2; // strip trailing CRLF before next boundary
    sections.push(body.slice(sectionStart, sectionEnd));
    cursor = next;
  }

  for (const section of sections) {
    const headerEnd = section.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd < 0) continue;
    const headerText = section.slice(0, headerEnd).toString('utf8');
    const data = section.slice(headerEnd + 4);

    const dispositionMatch = /content-disposition:\s*form-data;\s*([^\r\n]+)/i.exec(headerText);
    if (!dispositionMatch) continue;
    const params = dispositionMatch[1];
    const nameMatch = /name="([^"]+)"/i.exec(params);
    if (!nameMatch) continue;
    const name = nameMatch[1];
    const filenameMatch = /filename="([^"]*)"/i.exec(params);
    const ctMatch = /content-type:\s*([^\r\n]+)/i.exec(headerText);

    if (filenameMatch) {
      result.files[name] = {
        filename: filenameMatch[1] || undefined,
        contentType: (ctMatch?.[1] ?? 'application/octet-stream').trim().toLowerCase(),
        data,
      };
    } else {
      result.fields[name] = data.toString('utf8');
    }
  }

  return result;
}

function extractBoundary(contentType: string): string | null {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  if (!match) return null;
  return (match[1] ?? match[2] ?? '').trim();
}

function parseNumberField(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function clampPointCount(value: number): number {
  return Math.max(MIN_POINT_COUNT, Math.min(MAX_POINT_COUNT, Math.round(value)));
}

function readSpltMetadata(
  buffer: Buffer,
): { count: number; radius: number; version: number } | null {
  if (buffer.byteLength < 16) return null;
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  if (view.getUint32(0, true) !== SPLT_MAGIC) return null;
  return {
    count: view.getUint32(8, true),
    radius: view.getFloat32(12, true),
    version: view.getUint8(4),
  };
}

function cachedSpltMatches(buffer: Buffer, count: number): { count: number } | null {
  const metadata = readSpltMetadata(buffer);
  if (!metadata) return null;
  const targetFloor = Math.min(count, HIGH_QUALITY_CACHE_FLOOR);
  if (metadata.version !== CURRENT_SPLT_VERSION) return null;
  if (metadata.count < targetFloor) return null;
  return { count: metadata.count };
}

interface SharpRunOptions {
  bin: string;
  imagePath: string;
  outDir: string;
  signal: AbortSignal;
}

async function runSharp({
  bin,
  imagePath,
  outDir,
  signal,
}: SharpRunOptions): Promise<{ stderr: string }> {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(bin, ['predict', '-i', imagePath, '-o', outDir], {
      stdio: ['ignore', 'pipe', 'pipe'],
      signal,
    });
    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
      if (stderr.length > 4096) stderr = stderr.slice(-4096);
    });
    child.stdout.on('data', () => {
      // Discard stdout; SHARP logs progress here.
    });
    child.on('error', (error) => {
      rejectPromise(error);
    });
    child.on('close', (code) => {
      if (code === 0) resolvePromise({ stderr });
      else rejectPromise(new Error(`sharp exited ${code}: ${stderr.slice(-2048)}`));
    });
  });
}

async function findFirstPly(dir: string): Promise<string | null> {
  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(dir);
  const ply = entries.find((entry) => entry.toLowerCase().endsWith('.ply'));
  return ply ? join(dir, ply) : null;
}

export function sharpPredictPlugin(): Plugin {
  return {
    name: 'sharp-predict',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'GET' && req.url === '/__sharp/list') {
          if (!isLoopback(req)) return reply(res, 403, 'forbidden');
          const publicSharpDir = resolve(server.config.root, 'public/sharp');
          try {
            const { readdir } = await import('node:fs/promises');
            const entries = await readdir(publicSharpDir).catch(() => []);
            const sources = entries
              .filter((entry) => entry.toLowerCase().endsWith('.splt'))
              .sort((a, b) => a.localeCompare(b))
              .map((entry) => ({
                label: entry.replace(/\.splt$/i, ''),
                value: `/sharp/${entry}`,
              }));
            return reply(res, 200, JSON.stringify(sources), 'application/json; charset=utf-8');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'sharp list failed';
            return reply(res, 500, message);
          }
        }

        if (req.method !== 'POST' || req.url !== '/__sharp/predict') {
          return next();
        }

        if (!isLoopback(req)) return reply(res, 403, 'forbidden');

        const contentType = req.headers['content-type'] ?? '';
        if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
          return reply(res, 415, 'unsupported media type');
        }
        const boundary = extractBoundary(contentType);
        if (!boundary) return reply(res, 400, 'missing boundary');

        const result = await readBody(req, MAX_BODY_BYTES);
        if ('error' in result) return reply(res, result.status, result.error);

        let parsed: ParsedMultipart;
        try {
          parsed = parseMultipart(result.body, boundary);
        } catch {
          return reply(res, 400, 'malformed multipart');
        }

        const file = parsed.files.image;
        if (!file || file.data.length === 0) return reply(res, 400, 'image field required');
        if (file.data.byteLength > MAX_IMAGE_BYTES) return reply(res, 413, 'payload too large');
        if (!ALLOWED_MIME.has(file.contentType)) {
          return reply(res, 400, `unsupported image type: ${file.contentType}`);
        }

        const requestedCount = parseNumberField(parsed.fields.count, DEFAULT_POINT_COUNT);
        const radius = parseNumberField(parsed.fields.radius, DEFAULT_FIT_RADIUS);
        const count = clampPointCount(requestedCount);
        if (!Number.isFinite(count) || !Number.isFinite(radius)) {
          return reply(res, 400, 'invalid count/radius');
        }

        const id = createHash('sha256').update(file.data).digest('hex').slice(0, 16);
        const publicSharpDir = resolve(server.config.root, 'public/sharp');
        const outputPath = join(publicSharpDir, `${id}.splt`);
        const url = `/sharp/${id}.splt`;
        await mkdir(publicSharpDir, { recursive: true });

        if (existsSync(outputPath)) {
          const cached = await readFile(outputPath);
          const cachedMatch = cachedSpltMatches(cached, count);
          if (cachedMatch) {
            return reply(
              res,
              200,
              JSON.stringify({
                url,
                id,
                count: cachedMatch.count,
                fitRadius: radius,
                bytes: cached.byteLength,
                cached: true,
              }),
              'application/json; charset=utf-8',
            );
          }
        }

        const localSharp = resolve(server.config.root, '.sharp/venv/bin/sharp');
        const bin = process.env.SHARP_BIN ?? (existsSync(localSharp) ? localSharp : 'sharp');
        const ext =
          file.contentType === 'image/png'
            ? 'png'
            : file.contentType === 'image/webp'
              ? 'webp'
              : 'jpg';
        const workDir = join(tmpdir(), `sharp-${id}`);
        const tmpImage = join(workDir, `input.${ext}`);
        const tmpOutDir = join(workDir, 'out');
        await mkdir(workDir, { recursive: true });
        await mkdir(tmpOutDir, { recursive: true });
        await writeFile(tmpImage, file.data);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), SPAWN_TIMEOUT_MS);

        try {
          try {
            await runSharp({
              bin,
              imagePath: tmpImage,
              outDir: tmpOutDir,
              signal: controller.signal,
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'sharp failed';
            if (/ENOENT|not found|spawn/i.test(message)) {
              return reply(res, 503, `sharp not configured: ${message}`);
            }
            return reply(res, 502, `sharp failed: ${message}`);
          }

          let plyPath: string | null;
          try {
            plyPath = await findFirstPly(tmpOutDir);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown';
            return reply(res, 502, `sharp output unreadable: ${message}`);
          }
          if (!plyPath) return reply(res, 502, 'sharp produced no .ply');

          let buffer: Buffer;
          let convertedCount = count;
          try {
            const plyBytes = await readFile(plyPath);
            const { plyToSplt } = (await import('../../scripts/lib/plyToSplt.mjs')) as {
              plyToSplt: (
                input: Buffer,
                options: { count: number; radius: number },
              ) => { buffer: Buffer; vertexCount: number; count: number };
            };
            const converted = plyToSplt(plyBytes, { count, radius });
            buffer = converted.buffer;
            convertedCount = converted.count;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'conversion failed';
            return reply(res, 502, `splt conversion failed: ${message}`);
          }

          await writeFile(outputPath, buffer);

          return reply(
            res,
            200,
            JSON.stringify({
              url,
              id,
              count: convertedCount,
              fitRadius: radius,
              bytes: buffer.byteLength,
              cached: false,
            }),
            'application/json; charset=utf-8',
          );
        } finally {
          clearTimeout(timeout);
          await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
        }
      });
    },
  };
}
