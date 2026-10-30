import type { Lang } from '../../shared/challenges';
import type { Status } from '../hooks/useGame';
import type { RunResult } from '../lib/runner';
import { TerminalIcon } from './Icons';

type Props = { output: RunResult | null; status: Status; lang: Lang };

export function Terminal({ output, status, lang }: Props) {
  const passed = output?.results.filter((r) => r.passed).length ?? 0;
  const total = output?.results.length ?? 0;

  return (
    <section className="terminal" aria-label="Saída do terminal">
      <h2 className="terminal__title">
        <TerminalIcon size={14} /> Saída do terminal
        {total > 0 && (
          <span className={`terminal__score ${passed === total ? 'is-ok' : 'is-bad'}`}>
            {passed}/{total} testes
          </span>
        )}
      </h2>

      <div className="terminal__log" role="log" aria-live="polite">
        {status === 'running' && <p className="t-dim">{'>'} {lang === 'java' ? 'javac Solucao.java && java Main' : lang === 'python' ? 'python3 solucao.py' : 'node solucao.js (Web Worker)'}…</p>}
        {!output && status !== 'running' && (
          <p className="t-dim">
            {'>'} Aguardando execução… (Ctrl + Enter)
            <span className="caret" />
          </p>
        )}

        {output?.error && <pre className="t-bad t-pre">{'>'} {output.error}</pre>}

        {output?.logs.map((log, i) => (
          <p key={`l${i}`} className="t-log">
            {'>'} {log}
          </p>
        ))}

        {output?.results.map((r, i) => (
          <div key={i} className={r.passed ? 't-ok' : 't-bad'}>
            <p>
              {'>'} TESTE {i + 1}: {r.passed ? 'PASSOU' : 'FALHOU'}
            </p>
            <p className="t-detail">
              entrada: ({r.input})
              {r.error ? (
                <> · erro: {r.error}</>
              ) : (
                <>
                  {' '}
                  · esperado: {r.expected}
                  {!r.passed && <> · obtido: {r.actual}</>}
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
