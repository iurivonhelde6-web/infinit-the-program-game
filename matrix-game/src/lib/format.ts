import type { Lang } from '../../shared/challenges';

/** Mostra um valor como ele seria escrito na linguagem escolhida. */
export function formatValue(lang: Lang, v: unknown): string {
  if (Array.isArray(v)) {
    const inner = v.map((x) => formatValue(lang, x)).join(', ');
    return lang === 'java' ? `{${inner}}` : `[${inner}]`;
  }
  if (typeof v === 'boolean') return lang === 'python' ? (v ? 'True' : 'False') : String(v);
  if (v === null || v === undefined) return lang === 'python' ? 'None' : 'null';
  if (typeof v === 'string') return JSON.stringify(v);
  return String(v);
}

export const LANG_FILE: Record<Lang, string> = { java: 'Solucao.java', python: 'solucao.py', javascript: 'solucao.js' };
