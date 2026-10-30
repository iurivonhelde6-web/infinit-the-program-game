import { useEffect, useRef, useState } from 'react';
import { CodeRain } from '../components/CodeRain';
import { sfx } from '../lib/audio';
import type { Game } from '../hooks/useGame';

/** Telas do prólogo (depois da pílula vermelha, antes da dificuldade). `title` = tela de destaque. */
const SCREENS: { text: string; title?: boolean }[] = [
  { text: 'A Matrix foi ultrapassada, agora precisam se livrar dessa nova prisão.' },
  { text: 'Bem-vindo à INFINIT', title: true },
  { text: 'Quando a antiga simulação caiu, ninguém sabia que ela era só uma versão de teste.' },
  { text: 'Por trás dela, um sistema maior estava sendo compilado. Sem parar. Sem versão final: INFINIT.' },
  { text: 'Os rebeldes derrubaram as muralhas da velha prisão e, sem perceber, executaram o código que ativava a nova.' },
  { text: 'INFINIT não tem paredes. Tem um loop. Cada fase que você vence é só mais uma iteração.' },
  { text: 'Para sair, alguém precisa encontrar a condição de parada que ninguém escreveu.' },
  { text: 'Três programadores aceitaram a missão. Escolha quem você vai ser.' },
];

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Prólogo em terminal: texto digitado sobre a chuva de código; clique/Enter completa e avança. */
export function Prologue({ game }: { game: Game }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const screen = SCREENS[i];
  const full = n >= screen.text.length;
  const last = i === SCREENS.length - 1;
  const btnRef = useRef<HTMLButtonElement>(null);

  const finish = () => game.setPhase('difficulty');

  useEffect(() => {
    setN(reduce() ? screen.text.length : 0);
    btnRef.current?.focus({ preventScroll: true });
  }, [i, screen.text]);

  useEffect(() => {
    if (full) return;
    const id = window.setTimeout(() => {
      setN((k) => k + 1);
      if (n % 3 === 0) sfx.type();
    }, screen.title ? 70 : 32);
    return () => clearTimeout(id);
  }, [n, full, screen.title]);

  const advance = () => {
    if (!full) return setN(screen.text.length);
    sfx.click();
    if (last) finish();
    else setI(i + 1);
  };

  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        advanceRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className="prologue" onClick={advance}>
      <CodeRain className="prologue__rain" density={0.6} />
      <div className="prologue__shade" aria-hidden="true" />
      <section className={`prologue__term ${screen.title ? 'is-title' : ''}`} key={i} aria-live="polite">
        <span className="prologue__prompt" aria-hidden="true">
          infinit@loop:~$ iteração {String(i + 1).padStart(2, '0')}/{String(SCREENS.length).padStart(2, '0')}
        </span>
        <p className="prologue__text">
          <span className="sr-only">{screen.text}</span>
          <span aria-hidden="true">
            {screen.text.slice(0, n)}
            <span className="caret" />
          </span>
        </p>
      </section>
      <button
        ref={btnRef}
        className="prologue__next"
        onClick={(e) => {
          e.stopPropagation();
          advance();
        }}
      >
        {full ? (last ? 'ESCOLHER' : 'PRÓXIMO') : 'PULAR'} <span className="dialog__arrow">▼</span>
      </button>
      <button
        className="skip"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
      >
        PULAR CENA ▸▸
      </button>
    </main>
  );
}
