// Handler HTTP da API (usado pelo servidor de produção e pelo plugin do Vite em desenvolvimento).
import { LANG_STATUS, MAX_CODE, runSubmission } from './runner.mjs';

const MAX_PARALLEL = Number(process.env.MAX_PARALLEL ?? 3);
const RATE_PER_MIN = Number(process.env.RATE_PER_MIN ?? 40);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '';

let running = 0;
const hits = new Map(); // ip -> timestamps

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE_PER_MIN;
}

/** Retorna true se a requisição era da API e foi respondida. */
export async function handleApi(req, res) {
  const url = new URL(req.url ?? '/', 'http://x');
  if (!url.pathname.startsWith('/api/')) return false;

  if (CORS_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return true;
    }
  }

  if (url.pathname === '/api/health' && req.method === 'GET') {
    json(res, 200, { ok: true, languages: LANG_STATUS });
    return true;
  }

  if (url.pathname === '/api/run' && req.method === 'POST') {
    const ip = req.socket.remoteAddress ?? '?';
    if (rateLimited(ip)) return json(res, 429, { error: 'Muitas execuções seguidas. Respire, Neo.' }), true;
    if (running >= MAX_PARALLEL) return json(res, 503, { error: 'Servidor ocupado, tente de novo em instantes.' }), true;
    running++;
    try {
      const body = JSON.parse(await readBody(req, MAX_CODE * 2 + 1024));
      const result = await runSubmission({ lang: body.lang, challengeId: Number(body.challengeId), code: body.code });
      json(res, 200, result);
    } catch {
      json(res, 400, { error: 'Requisição inválida.' });
    } finally {
      running--;
    }
    return true;
  }

  json(res, 404, { error: 'Rota não encontrada.' });
  return true;
}
