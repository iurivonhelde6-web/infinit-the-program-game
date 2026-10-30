/**
 * Código do Web Worker que executa a solução do jogador.
 * Fica como string para funcionar em qualquer bundler (vira um Blob em runtime)
 * e também para ser reutilizado por `scripts/validate-challenges.ts`.
 *
 * O worker não enxerga o DOM, cookies nem localStorage da página. Loops infinitos
 * são tratados pelo `runner.ts`, que encerra o worker após o tempo limite.
 */
export const WORKER_SOURCE = String.raw`
const MAX_LOGS = 50;

function show(v) {
  if (v === undefined) return 'undefined';
  if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
  if (typeof v === 'function') return '[Function]';
  if (typeof v === 'bigint') return v + 'n';
  if (typeof v === 'string') return JSON.stringify(v);
  try { return JSON.stringify(v); } catch (e) { return String(v); }
}

function logText(v) {
  return typeof v === 'string' ? v : show(v);
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(function (k) { return Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]); });
}

function errText(e) {
  return e && e.message ? (e.name ? e.name + ': ' : '') + e.message : String(e);
}

self.onmessage = function (ev) {
  const code = ev.data.code, fn = ev.data.fn, tests = ev.data.tests;
  const logs = [];
  const push = function () {
    if (logs.length < MAX_LOGS) logs.push(Array.prototype.map.call(arguments, logText).join(' '));
  };
  const shim = { log: push, info: push, warn: push, error: push };

  let target;
  try {
    const factory = new Function('console', '"use strict";\n' + code + '\n;return (typeof ' + fn + ' === "function") ? ' + fn + ' : undefined;');
    target = factory(shim);
  } catch (e) {
    self.postMessage({ kind: 'error', message: errText(e), logs: logs });
    return;
  }
  if (typeof target !== 'function') {
    self.postMessage({ kind: 'missing', message: 'Não encontrei a função "' + fn + '". Confira o nome.', logs: logs });
    return;
  }

  const results = tests.map(function (t) {
    const args = JSON.parse(JSON.stringify(t.input));
    try {
      const actual = target.apply(null, args);
      return { input: t.input.map(show).join(', '), expected: show(t.expected), actual: show(actual), passed: deepEqual(actual, t.expected) };
    } catch (e) {
      return { input: t.input.map(show).join(', '), expected: show(t.expected), error: errText(e), passed: false };
    }
  });
  self.postMessage({ kind: 'done', results: results, logs: logs });
};
`;
