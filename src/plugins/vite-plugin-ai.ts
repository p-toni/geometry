import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

const MAX_BODY_BYTES = 64 * 1024;
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

function reply(res: ServerResponse, status: number, message: string, contentType = 'text/plain; charset=utf-8') {
  res.statusCode = status;
  res.setHeader('Content-Type', contentType);
  res.end(message);
}

export function aiProxyPlugin(): Plugin {
  let apiKey = '';

  return {
    name: 'ai-proxy',
    apply: 'serve',
    configResolved(config) {
      const env = loadEnv(config.mode, config.envDir ?? config.root, '');
      apiKey = env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? '';
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

        if (!apiKey) return reply(res, 503, 'GEMINI_API_KEY not configured');

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
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
          });
          for (const part of response.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData) {
              const dataUrl = `data:${part.inlineData.mimeType ?? 'image/png'};base64,${part.inlineData.data}`;
              return reply(res, 200, JSON.stringify({ dataUrl }), 'application/json; charset=utf-8');
            }
          }
          return reply(res, 502, 'no image in response');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'generation failed';
          return reply(res, 502, message);
        }
      });
    },
  };
}
