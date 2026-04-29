import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

const MAX_BODY_BYTES = 1024 * 1024;
const MAX_SLUG_LENGTH = 120;
const SLUG_RE = /^[a-z0-9][a-z0-9_-]*(\/[a-z0-9][a-z0-9_-]*)*$/;
const ALLOWED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '[::1]',
  '::1',
]);

// Keep in sync with the BlockType union in src/types.ts and BLOCK_TYPES in
// src/constants.ts. Duplicated here because this plugin runs at Vite config
// load time, before module aliases / DEV env are wired up.
const BLOCK_TYPES = new Set([
  'h1', 'h2', 'h3', 'p', 'quote', 'markdown', 'code', 'embed', 'image', 'link',
  'shader', 'voxel', 'threeSharp',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hostOf(value: string | undefined) {
  if (!value) return '';
  return value.split(':')[0]?.toLowerCase() ?? '';
}

function isLoopback(req: IncomingMessage) {
  const host = hostOf(req.headers.host);
  if (!ALLOWED_HOSTS.has(host)) return false;
  const origin = req.headers.origin;
  if (origin) {
    try {
      const originHost = new URL(origin).hostname.toLowerCase();
      if (!ALLOWED_HOSTS.has(originHost)) return false;
    } catch {
      return false;
    }
  }
  const referer = req.headers.referer;
  if (referer && !origin) {
    try {
      const refererHost = new URL(referer).hostname.toLowerCase();
      if (!ALLOWED_HOSTS.has(refererHost)) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function validateCanvas(value: unknown): { ok: true; canvas: unknown } | { ok: false; error: string } {
  if (!isRecord(value)) return { ok: false, error: 'canvas must be an object' };
  if (value.version !== 1) return { ok: false, error: 'canvas.version must be 1' };
  if (typeof value.slug !== 'string') return { ok: false, error: 'canvas.slug must be a string' };
  if (typeof value.title !== 'string') return { ok: false, error: 'canvas.title must be a string' };
  if (
    value.background !== undefined &&
    value.background !== 'paper' &&
    value.background !== 'ink'
  ) {
    return { ok: false, error: 'canvas.background is invalid' };
  }
  if (!Array.isArray(value.items)) return { ok: false, error: 'canvas.items must be an array' };

  for (let i = 0; i < value.items.length; i += 1) {
    const item = value.items[i];
    const path = `canvas.items[${i}]`;
    if (!isRecord(item)) return { ok: false, error: `${path} must be an object` };
    if (typeof item.id !== 'string') return { ok: false, error: `${path}.id must be a string` };
    if (typeof item.type !== 'string' || !BLOCK_TYPES.has(item.type)) {
      return { ok: false, error: `${path}.type is invalid` };
    }
    for (const key of ['col', 'row', 'cols', 'rows'] as const) {
      const n = item[key];
      if (typeof n !== 'number' || !Number.isFinite(n)) {
        return { ok: false, error: `${path}.${key} must be a number` };
      }
    }
    if (typeof item.color !== 'number' || ![0, 1, 2, 3, 4, 5].includes(item.color)) {
      return { ok: false, error: `${path}.color is invalid` };
    }
    if (typeof item.label !== 'string') return { ok: false, error: `${path}.label must be a string` };
    if (typeof item.content !== 'string') return { ok: false, error: `${path}.content must be a string` };
    if (item.controls !== undefined && !Array.isArray(item.controls)) {
      return { ok: false, error: `${path}.controls must be an array` };
    }
  }

  return { ok: true, canvas: value };
}

function readJsonBody(req: IncomingMessage, limit: number): Promise<{ body: string } | { error: string; status: number }> {
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

function reply(res: ServerResponse, status: number, message: string) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(message);
}

export function saveCanvasPlugin(): Plugin {
  return {
    name: 'save-canvas',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST' || !req.url?.startsWith('/__save/')) {
          return next();
        }

        if (!isLoopback(req)) {
          return reply(res, 403, 'forbidden');
        }

        const contentType = (req.headers['content-type'] ?? '').toLowerCase();
        if (!contentType.startsWith('application/json')) {
          return reply(res, 415, 'unsupported media type');
        }

        const slug = decodeURIComponent(req.url.slice('/__save/'.length));
        if (slug.length === 0 || slug.length > MAX_SLUG_LENGTH || !SLUG_RE.test(slug)) {
          return reply(res, 400, 'bad slug');
        }

        const result = await readJsonBody(req, MAX_BODY_BYTES);
        if ('error' in result) {
          return reply(res, result.status, result.error);
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(result.body);
        } catch {
          return reply(res, 400, 'invalid json');
        }

        const validated = validateCanvas(parsed);
        if (!validated.ok) {
          return reply(res, 400, `invalid canvas: ${validated.error}`);
        }

        if ((validated.canvas as { slug: string }).slug !== slug) {
          return reply(res, 400, 'slug mismatch');
        }

        try {
          const path = resolve(process.cwd(), 'src/content/canvases', `${slug}.json`);
          await mkdir(dirname(path), { recursive: true });
          await writeFile(path, `${JSON.stringify(validated.canvas, null, 2)}\n`);
          return reply(res, 200, 'ok');
        } catch {
          return reply(res, 500, 'write failed');
        }
      });
    },
  };
}
