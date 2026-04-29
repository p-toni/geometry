import { EventEmitter } from 'node:events';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ViteDevServer } from 'vite';
import { sharpPredictPlugin } from './vite-plugin-sharp';
import { plyToSplt } from '../../scripts/lib/plyToSplt.mjs';
import { spawn } from 'node:child_process';

const spawnFn = vi.hoisted(() => vi.fn());

vi.mock('node:child_process', () => ({
  spawn: spawnFn,
  default: { spawn: spawnFn },
}));

vi.mock('../../scripts/lib/plyToSplt.mjs', () => ({
  plyToSplt: vi.fn(() => ({
    buffer: makeSpltBuffer(1_200_000, 1.6),
    vertexCount: 12,
    count: 1_200_000,
  })),
}));

const spawnMock = vi.mocked(spawn);
const plyToSpltMock = vi.mocked(plyToSplt);

function makeSpltBuffer(count: number, radius: number) {
  const buffer = Buffer.alloc(32);
  buffer.write('SPLT', 0, 'ascii');
  buffer.writeUInt8(2, 4);
  buffer.writeUInt8(1, 5);
  buffer.writeUInt32LE(count, 8);
  buffer.writeFloatLE(radius, 12);
  return buffer;
}

function makeLegacySpltBuffer(count: number, radius: number) {
  const buffer = Buffer.alloc(16);
  buffer.write('SPLT', 0, 'ascii');
  buffer.writeUInt8(1, 4);
  buffer.writeUInt8(1, 5);
  buffer.writeUInt32LE(count, 8);
  buffer.writeFloatLE(radius, 12);
  return buffer;
}

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

async function startPluginServer(): Promise<TestServer> {
  const root = await mkdtemp(join(tmpdir(), 'sharp-plugin-test-'));
  let middleware: Middleware | null = null;
  const plugin = sharpPredictPlugin();
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

function imageRequest(bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47])) {
  const boundary = `----sharp-test-${Math.random().toString(16).slice(2)}`;
  const head = Buffer.from(
    `--${boundary}\r\n` +
      'Content-Disposition: form-data; name="image"; filename="image.png"\r\n' +
      'Content-Type: image/png\r\n\r\n',
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  return {
    body: Buffer.concat([head, bytes, tail]),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

function mockSpawnSuccess() {
  spawnMock.mockImplementation(((_bin: string, args?: readonly string[]) => {
    const child = new EventEmitter() as EventEmitter & {
      stdout: EventEmitter;
      stderr: EventEmitter;
    };
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    const argv = [...(args ?? [])];
    const outDir = String(argv[argv.indexOf('-o') + 1]);
    queueMicrotask(() => {
      void writeFile(join(outDir, 'cloud.ply'), Buffer.from('ply')).then(() => {
        child.emit('close', 0);
      });
    });
    return child;
  }) as unknown as typeof spawn);
}

function mockSpawnError(message: string) {
  spawnMock.mockImplementation((() => {
    const child = new EventEmitter() as EventEmitter & {
      stdout: EventEmitter;
      stderr: EventEmitter;
    };
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    queueMicrotask(() => child.emit('error', new Error(message)));
    return child;
  }) as unknown as typeof spawn);
}

function mockSpawnExit(code: number, stderr: string) {
  spawnMock.mockImplementation((() => {
    const child = new EventEmitter() as EventEmitter & {
      stdout: EventEmitter;
      stderr: EventEmitter;
    };
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    queueMicrotask(() => {
      child.stderr.emit('data', Buffer.from(stderr));
      child.emit('close', code);
    });
    return child;
  }) as unknown as typeof spawn);
}

let servers: TestServer[] = [];

beforeEach(() => {
  spawnMock.mockReset();
  plyToSpltMock.mockClear();
});

afterEach(async () => {
  await Promise.all(servers.map(({ server }) => closeServer(server)));
  await Promise.all(servers.map(({ root }) => rm(root, { recursive: true, force: true })));
  servers = [];
});

describe('sharpPredictPlugin', () => {
  it('rejects non-loopback hosts', async () => {
    const app = await startPluginServer();
    servers.push(app);
    const request = imageRequest();

    const response = await fetch(`${app.url}/__sharp/predict`, {
      method: 'POST',
      headers: { Origin: 'https://example.com', 'Content-Type': request.contentType },
      body: request.body,
    });

    expect(response.status).toBe(403);
    expect(await response.text()).toBe('forbidden');
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('rejects oversized bodies', async () => {
    const app = await startPluginServer();
    servers.push(app);
    const request = imageRequest(Buffer.alloc(16 * 1024 * 1024 + 1));

    const response = await fetch(`${app.url}/__sharp/predict`, {
      method: 'POST',
      headers: { 'Content-Type': request.contentType },
      body: request.body,
    });

    expect(response.status).toBe(413);
    expect(await response.text()).toBe('payload too large');
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('returns 503 when the sharp binary is missing', async () => {
    mockSpawnError('spawn sharp ENOENT');
    const app = await startPluginServer();
    servers.push(app);
    const request = imageRequest();

    const response = await fetch(`${app.url}/__sharp/predict`, {
      method: 'POST',
      headers: { 'Content-Type': request.contentType },
      body: request.body,
    });

    expect(response.status).toBe(503);
    expect(await response.text()).toContain('sharp not configured');
  });

  it('returns 502 when sharp exits unsuccessfully', async () => {
    mockSpawnExit(1, 'out of memory');
    const app = await startPluginServer();
    servers.push(app);
    const request = imageRequest();

    const response = await fetch(`${app.url}/__sharp/predict`, {
      method: 'POST',
      headers: { 'Content-Type': request.contentType },
      body: request.body,
    });

    expect(response.status).toBe(502);
    expect(await response.text()).toContain('sharp failed: sharp exited 1: out of memory');
  });

  it('writes a splt once and serves idempotent hits from disk', async () => {
    mockSpawnSuccess();
    const app = await startPluginServer();
    servers.push(app);
    const firstRequest = imageRequest(Buffer.from('same-image'));

    const first = await fetch(`${app.url}/__sharp/predict`, {
      method: 'POST',
      headers: { 'Content-Type': firstRequest.contentType },
      body: firstRequest.body,
    });
    const firstPayload = (await first.json()) as {
      url: string;
      id: string;
      count: number;
      fitRadius: number;
      bytes: number;
      cached: boolean;
    };

    expect(first.status).toBe(200);
    expect(firstPayload).toMatchObject({
      url: `/sharp/${firstPayload.id}.splt`,
      count: 1_200_000,
      fitRadius: 1.6,
      bytes: 32,
      cached: false,
    });
    expect(
      (await readFile(join(app.root, 'public/sharp', `${firstPayload.id}.splt`))).byteLength,
    ).toBe(32);

    const secondRequest = imageRequest(Buffer.from('same-image'));
    const second = await fetch(`${app.url}/__sharp/predict`, {
      method: 'POST',
      headers: { 'Content-Type': secondRequest.contentType },
      body: secondRequest.body,
    });
    const secondPayload = (await second.json()) as { cached: boolean };

    expect(second.status).toBe(200);
    expect(secondPayload).toMatchObject({ cached: true });
    expect(spawnMock).toHaveBeenCalledTimes(1);
    expect(plyToSpltMock).toHaveBeenCalledTimes(1);
  });

  it('regenerates a stale lower-density cached splt', async () => {
    mockSpawnSuccess();
    const app = await startPluginServer();
    servers.push(app);
    const request = imageRequest(Buffer.from('upgrade-me'));
    const staleId = 'a8590f2423647693';
    await mkdir(join(app.root, 'public/sharp'), { recursive: true });
    await writeFile(
      join(app.root, 'public/sharp', `${staleId}.splt`),
      makeLegacySpltBuffer(80_000, 1.6),
    );

    const response = await fetch(`${app.url}/__sharp/predict`, {
      method: 'POST',
      headers: { 'Content-Type': request.contentType },
      body: request.body,
    });
    const payload = (await response.json()) as { cached: boolean; count: number };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({ cached: false, count: 1_200_000 });
    expect(spawnMock).toHaveBeenCalledTimes(1);
  });
});
