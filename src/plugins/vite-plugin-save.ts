import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { Plugin } from 'vite';

export function saveCanvasPlugin(): Plugin {
  return {
    name: 'save-canvas',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST' || !req.url?.startsWith('/__save/')) {
          return next();
        }

        const slug = decodeURIComponent(req.url.slice('/__save/'.length));
        if (!/^[a-z0-9/_-]+$/.test(slug)) {
          res.statusCode = 400;
          return res.end('bad slug');
        }

        let body = '';
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString('utf8');
        });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body) as unknown;
            const path = resolve(process.cwd(), 'src/content/canvases', `${slug}.json`);
            await mkdir(dirname(path), { recursive: true });
            await writeFile(path, `${JSON.stringify(parsed, null, 2)}\n`);
            server.ws.send({ type: 'full-reload' });
            res.statusCode = 200;
            res.end('ok');
          } catch (error) {
            res.statusCode = 500;
            res.end(error instanceof Error ? error.message : String(error));
          }
        });
      });
    },
  };
}
