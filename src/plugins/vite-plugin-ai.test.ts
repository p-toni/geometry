// @vitest-environment node

import { createHash } from 'node:crypto';
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ViteDevServer } from 'vite';
import { aiProxyPlugin } from './vite-plugin-ai';

const generateMock = vi.hoisted(() => vi.fn());
const openAIMock = vi.hoisted(() =>
  vi.fn(function OpenAI() {
    return {
      images: {
        generate: generateMock,
      },
    };
  }),
);

vi.mock('openai', () => ({
  default: openAIMock,
}));

type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (error?: unknown) => void,
) => void | Promise<void>;

interface TestServer {
  root: string;
  url: string;
  server: Server;
}

async function startPluginServer(
  apiKey = 'test-key',
  envFiles: Record<string, string> = {},
): Promise<TestServer> {
  const root = await mkdtemp(join(tmpdir(), 'ai-plugin-test-'));
  await Promise.all(
    Object.entries(envFiles).map(([filename, content]) => writeFile(join(root, filename), content)),
  );
  const previous = process.env.OPENAI_API_KEY;
  if (apiKey) process.env.OPENAI_API_KEY = apiKey;
  else delete process.env.OPENAI_API_KEY;

  let middleware: Middleware | null = null;
  const plugin = aiProxyPlugin();
  if (typeof plugin.configResolved === 'function') {
    await plugin.configResolved({
      mode: 'test',
      envDir: root,
      root,
    } as ViteDevServer['config']);
  }
  process.env.OPENAI_API_KEY = previous;
  if (previous === undefined) delete process.env.OPENAI_API_KEY;

  if (typeof plugin.configureServer !== 'function') {
    throw new Error('configureServer hook not registered');
  }
  plugin.configureServer({
    config: { root },
    middlewares: {
      use(fn: Middleware) {
        middleware = fn;
      },
    },
  } as unknown as ViteDevServer);
  if (!middleware) throw new Error('middleware not registered');

  const server = createServer((req, res) => {
    void middleware?.(req, res, () => {
      res.statusCode = 404;
      res.end('not found');
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('server did not bind');
  return { root, url: `http://127.0.0.1:${address.port}`, server };
}

function closeServer(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

let servers: TestServer[] = [];

beforeEach(() => {
  generateMock.mockReset();
  openAIMock.mockClear();
});

afterEach(async () => {
  await Promise.all(servers.map(({ server }) => closeServer(server)));
  await Promise.all(servers.map(({ root }) => rm(root, { recursive: true, force: true })));
  servers = [];
});

describe('aiProxyPlugin', () => {
  it('rejects non-loopback hosts', async () => {
    const app = await startPluginServer();
    servers.push(app);

    const response = await fetch(`${app.url}/__ai/generate-image`, {
      method: 'POST',
      headers: {
        Origin: 'https://example.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'a small room' }),
    });

    expect(response.status).toBe(403);
    expect(await response.text()).toBe('forbidden');
    expect(generateMock).not.toHaveBeenCalled();
  });

  it('requires OPENAI_API_KEY', async () => {
    const app = await startPluginServer('');
    servers.push(app);

    const response = await fetch(`${app.url}/__ai/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'a small room' }),
    });

    expect(response.status).toBe(503);
    expect(await response.text()).toBe('OPENAI_API_KEY not configured');
  });

  it('rejects empty prompts', async () => {
    const app = await startPluginServer();
    servers.push(app);

    const response = await fetch(`${app.url}/__ai/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '   ' }),
    });

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('prompt must be a non-empty string');
  });

  it('writes generated image bytes to public/images', async () => {
    const bytes = Buffer.from('png bytes');
    const id = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    generateMock.mockResolvedValue({
      data: [{ b64_json: bytes.toString('base64') }],
    });
    const app = await startPluginServer();
    servers.push(app);

    const response = await fetch(`${app.url}/__ai/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'a small room' }),
    });
    const payload = (await response.json()) as {
      url: string;
      id: string;
      bytes: number;
      mimeType: string;
      model: string;
    };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      url: `/images/${id}.png`,
      id,
      bytes: bytes.byteLength,
      mimeType: 'image/png',
      model: 'gpt-image-2',
    });
    expect(await readFile(join(app.root, 'public/images', `${id}.png`))).toEqual(bytes);
    expect(generateMock).toHaveBeenCalledWith({
      model: 'gpt-image-2',
      prompt: 'a small room',
      n: 1,
      size: '1024x1024',
      output_format: 'png',
    });
  });

  it('prefers project-local env files over inherited process env', async () => {
    const bytes = Buffer.from('png bytes');
    generateMock.mockResolvedValue({
      data: [{ b64_json: bytes.toString('base64') }],
    });
    const app = await startPluginServer('stale-process-key', {
      '.env.local': 'OPENAI_API_KEY=project-local-key\n',
    });
    servers.push(app);

    const response = await fetch(`${app.url}/__ai/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'a small room' }),
    });

    expect(response.status).toBe(200);
    expect(openAIMock).toHaveBeenCalledWith({ apiKey: 'project-local-key' });
  });

  it('surfaces OpenAI failures', async () => {
    generateMock.mockRejectedValue(new Error('quota exceeded'));
    const app = await startPluginServer();
    servers.push(app);

    const response = await fetch(`${app.url}/__ai/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'a small room' }),
    });

    expect(response.status).toBe(502);
    expect(await response.text()).toBe('quota exceeded');
  });
});
