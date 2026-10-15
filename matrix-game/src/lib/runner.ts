import { testsFor, type Challenge, type Lang } from '../../shared/challenges';
import { WORKER_SOURCE } from './workerSource';

export type TestResult = { input: string; expected: string; actual?: string; error?: string; passed: boolean };

export type RunResult = {
  success: boolean;
  /** O código não chegou a rodar os testes (compilação, sintaxe, função ausente, timeout). */
  fatal?: boolean;
  compile?: boolean;
  error?: string;
  results: TestResult[];
  logs: string[];
};

export const TIMEOUT_MS = 2000;

/** URL do servidor de compilação. Vazio = mesmo domínio (dev com Vite ou `npm start`). */
const RUNNER_URL = (import.meta.env.VITE_RUNNER_URL ?? '').replace(/\/$/, '');

let workerUrl: string | null = null;
const getWorkerUrl = () => (workerUrl ??= URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' })));

/** JavaScript roda no próprio navegador, em um Web Worker descartável. */
function runJavaScript(code: string, challenge: Challenge): Promise<RunResult> {
  const v = challenge.variants.javascript;
  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(getWorkerUrl());
    } catch {
      resolve({ success: false, fatal: true, error: 'Seu navegador não permitiu executar o código (Web Worker).', results: [], logs: [] });
      return;
    }
    const finish = (r: RunResult) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(r);
    };
    const timer = window.setTimeout(
      () => finish({ success: false, fatal: true, error: `Tempo esgotado (${TIMEOUT_MS / 1000}s). Existe um loop infinito no seu código?`, results: [], logs: [] }),
      TIMEOUT_MS,
    );
    worker.onmessage = (ev: MessageEvent) => {
      const d = ev.data;
      if (d.kind === 'done') finish({ success: d.results.every((r: TestResult) => r.passed), results: d.results, logs: d.logs });
      else finish({ success: false, fatal: true, compile: d.kind === 'error', error: d.message, results: [], logs: d.logs });
    };
    worker.onerror = (ev) => {
      ev.preventDefault();
      finish({ success: false, fatal: true, error: ev.message || 'Erro desconhecido ao executar.', results: [], logs: [] });
    };
    worker.postMessage({ code, fn: v.fn, tests: testsFor(challenge, 'javascript') });
  });
}

/** Java e Python são compilados/executados de verdade no servidor (javac + JVM / CPython). */
async function runOnServer(lang: Lang, code: string, challenge: Challenge): Promise<RunResult> {
  try {
    const res = await fetch(`${RUNNER_URL}/api/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang, challengeId: challenge.id, code }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, fatal: true, error: data.error ?? `Servidor respondeu ${res.status}.`, results: [], logs: [] };
    return { results: [], logs: [], ...data };
  } catch {
    return {
      success: false,
      fatal: true,
      error: 'Servidor de compilação offline. Rode "npm run dev" (ou "npm start") para compilar Java e Python.',
      results: [],
      logs: [],
    };
  }
}

export function runCode(lang: Lang, code: string, challenge: Challenge): Promise<RunResult> {
  return lang === 'javascript' ? runJavaScript(code, challenge) : runOnServer(lang, code, challenge);
}

export type ServerStatus = { online: boolean; languages: Partial<Record<Lang, boolean>> };

export async function checkServer(): Promise<ServerStatus> {
  try {
    const res = await fetch(`${RUNNER_URL}/api/health`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return { online: true, languages: data.languages ?? {} };
  } catch {
    return { online: false, languages: { javascript: true } };
  }
}
