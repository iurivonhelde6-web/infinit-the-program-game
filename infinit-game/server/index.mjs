// Servidor de produção: entrega o build (dist/) e a API de compilação. Sem dependências externas.
// Uso: npm run build && npm start
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApi } from './api.mjs';
import { LANG_STATUS } from './runner.mjs';

const ROOT = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

async function serveStatic(req, res) {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  let file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT)) {
    res.statusCode = 403;
    return res.end();
  }
  try {
    const s = await stat(file);
    if (s.isDirectory()) file = join(file, 'index.html');
  } catch {
    file = join(ROOT, 'index.html'); // SPA
  }
  try {
    await stat(file);
  } catch {
    res.statusCode = 404;
    return res.end('Not found');
  }
  res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
  if (file.includes(`${ROOT}/assets/`)) res.setHeader('Cache-Control', 'public, max-age=86400');
  createReadStream(file).pipe(res);
}

createServer(async (req, res) => {
  try {
    if (await handleApi(req, res)) return;
    await serveStatic(req, res);
  } catch {
    res.statusCode = 500;
    res.end();
  }
}).listen(PORT, HOST, () => {
  console.log(`INFINIT - The Program Game em http://${HOST}:${PORT}`);
  console.log('Linguagens disponíveis:', LANG_STATUS);
});
