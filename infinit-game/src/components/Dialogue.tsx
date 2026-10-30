import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { sfx } from '../lib/audio';

export type Line = { speaker: string; text: string; portrait?: string; tone?: 'hero' | 'smith' | 'operator' | 'narrator'; color?: string };

type Props = {
  lines: Line[];
  /** Chamado depois da última fala. */
  onDone?: () => void;
  /** Texto do botão da última fala. */
  doneLabel?: string;
  /** Captura Enter/Espaço globalmente (cutscenes em tela cheia). */
  globalKeys?: boolean;
  compact?: boolean;
  /** Avisado sempre que a fala atual muda (para sincronizar a cena). */
  onLine?: (index: number) => void;
};

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Caixa de diálogo estilo RPG: texto digitado, clique/Enter completa a fala e depois avança. */
export function Dialogue({ lines, onDone, doneLabel = 'CONTINUAR', globalKeys = false, compact = false, onLine }: Props) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const line = lines[Math.min(i, lines.length - 1)];
  const full = n >= line.text.length;
  const last = i >= lines.length - 1;
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setN(reduce() ? line.text.length : 0);
  }, [i, line.text]);

  const onLineRef = useRef(onLine);
  onLineRef.current = onLine;
  useEffect(() => {
    onLineRef.current?.(i);
  }, [i]);

  useEffect(() => {
    if (full) return;
    const id = window.setTimeout(() => {
      setN((k) => k + 1);
      if (n % 3 === 0) sfx.type();
    }, 20);
    return () => clearTimeout(id);
  }, [n, full]);

  useEffect(() => {
    btnRef.current?.focus({ preventScroll: true });
  }, [i]);

  const advance = () => {
    if (!full) return setN(line.text.length);
    sfx.click();
    if (last) onDone?.();
    else setI(i + 1);
  };

  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  useEffect(() => {
    if (!globalKeys) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        advanceRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [globalKeys]);

  return (
    <div className={`dialog tone-${line.tone ?? 'operator'} ${compact ? 'is-compact' : ''}`} onClick={advance} style={line.color ? ({ '--accent': line.color } as CSSProperties) : undefined}>
      {line.portrait && <img className="dialog__face" src={line.portrait} alt="" />}
      <div className="dialog__body">
        <div className="dialog__name">{line.speaker}</div>
        <p className="dialog__text" aria-live="polite">
          <span className="sr-only">{line.text}</span>
          <span aria-hidden="true">
            {line.text.slice(0, n)}
            {!full && <span className="caret" />}
          </span>
        </p>
      </div>
      <button
        ref={btnRef}
        className="dialog__next"
        onClick={(e) => {
          e.stopPropagation();
          advance();
        }}
      >
        {full ? (last ? doneLabel : 'PRÓXIMO') : 'PULAR'} <span className="dialog__arrow">▼</span>
      </button>
      <span className="dialog__count" aria-hidden="true">
        {i + 1}/{lines.length}
      </span>
    </div>
  );
}
