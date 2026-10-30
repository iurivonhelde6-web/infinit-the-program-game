import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';

type Props = {
  text: string;
  speed?: number;
  onDone?: () => void;
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Efeito de digitação. Use `key={texto}` no pai para reiniciar.
 * Leitores de tela recebem o texto completo de imediato; clicar no texto pula a animação.
 */
export function Typewriter({ text, speed = 22, onDone }: Props) {
  const [n, setN] = useState(() => (prefersReducedMotion() ? text.length : 0));
  const done = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (n >= text.length) {
      if (!done.current && text) {
        done.current = true;
        onDoneRef.current?.();
      }
      return;
    }
    const id = window.setTimeout(() => {
      setN(n + 1);
      if (n % 3 === 0) sfx.type();
    }, speed);
    return () => clearTimeout(id);
  }, [n, text, speed]);

  return (
    <span onClick={() => setN(text.length)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, n)}
        {n < text.length && <span className="caret" />}
      </span>
    </span>
  );
}
