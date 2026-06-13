import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

const MAX_BODY_BYTES = 64 * 1024;
const IMAGE_MODEL = 'gpt-image-2';
const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

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

function readJsonBody(
  req: IncomingMessage,
  limit: number,
): Promise<{ body: string } | { error: string; status: number }> {
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
      resolvePromise({ body: Buffer.concat(chunks).toString('utf8') });
    });
    req.on('error', () => {
      if (aborted) return;
      aborted = true;
      resolvePromise({ error: 'read error', status: 400 });
    });
  });
}

function reply(
  res: ServerResponse,
  status: number,
  message: string,
  contentType = 'text/plain; charset=utf-8',
) {
  res.statusCode = status;
  res.setHeader('Content-Type', contentType);
  res.end(message);
}

function unquoteEnvValue(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function readEnvFileValue(path: string, key: string) {
  if (!existsSync(path)) return undefined;
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const normalized = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const index = normalized.indexOf('=');
    if (index === -1) continue;
    if (normalized.slice(0, index).trim() !== key) continue;
    return unquoteEnvValue(normalized.slice(index + 1));
  }
  return undefined;
}

function localEnvValue(root: string, mode: string, key: string) {
  const filenames = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`];
  let value: string | undefined;
  for (const filename of filenames) {
    value = readEnvFileValue(resolve(root, filename), key) ?? value;
  }
  return value;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'generation failed';
}

export function aiProxyPlugin(): Plugin {
  let apiKey = '';

  return {
    name: 'ai-proxy',
    apply: 'serve',
    configResolved(config) {
      const envDir = config.envDir || config.root;
      const env = loadEnv(config.mode, envDir, '');
      apiKey =
        localEnvValue(envDir, config.mode, 'OPENAI_API_KEY') ??
        env.OPENAI_API_KEY ??
        process.env.OPENAI_API_KEY ??
        '';
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST' || req.url !== '/__ai/generate-image') {
          return next();
        }

        if (!isLoopback(req)) return reply(res, 403, 'forbidden');

        const contentType = (req.headers['content-type'] ?? '').toLowerCase();
        if (!contentType.startsWith('application/json')) {
          return reply(res, 415, 'unsupported media type');
        }

        if (!apiKey) return reply(res, 503, 'OPENAI_API_KEY not configured');

        const result = await readJsonBody(req, MAX_BODY_BYTES);
        if ('error' in result) return reply(res, result.status, result.error);

        let parsed: unknown;
        try {
          parsed = JSON.parse(result.body);
        } catch {
          return reply(res, 400, 'invalid json');
        }

        const prompt =
          typeof parsed === 'object' && parsed !== null && 'prompt' in parsed
            ? (parsed as { prompt: unknown }).prompt
            : null;
        if (typeof prompt !== 'string' || prompt.trim() === '') {
          return reply(res, 400, 'prompt must be a non-empty string');
        }

        try {
          const { default: OpenAI } = await import('openai');
          const openai = new OpenAI({ apiKey });
          const imageRequest = {
            model: IMAGE_MODEL,
            prompt: prompt.trim(),
            n: 1,
            size: '1024x1024' as const,
            output_format: 'png' as const,
          };
          const response = await openai.images.generate(imageRequest);
          const base64 = response.data?.[0]?.b64_json;
          if (typeof base64 !== 'string' || !base64)
            return reply(res, 502, 'no image in response');

          const buffer = Buffer.from(base64, 'base64');
          if (buffer.byteLength === 0) return reply(res, 502, 'empty image in response');

          const id = createHash('sha256').update(buffer).digest('hex').slice(0, 16);
          const publicImagesDir = resolve(server.config.root, 'public/images');
          const filename = `${id}.png`;
          await mkdir(publicImagesDir, { recursive: true });
          await writeFile(join(publicImagesDir, filename), buffer);

          return reply(
            res,
            200,
            JSON.stringify({
              url: `/images/${filename}`,
              id,
              bytes: buffer.byteLength,
              mimeType: 'image/png',
              model: IMAGE_MODEL,
            }),
            'application/json; charset=utf-8',
          );
        } catch (error) {
          return reply(res, 502, errorMessage(error));
        }
      });
    },
  };
}
