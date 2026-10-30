import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { DIFFICULTIES, DIFFICULTY_ORDER, LANGS, LEVELS_PER_DIFFICULTY, type Difficulty } from '../../shared/challenges';
import { Model3D } from '../components/Model3D';
import { Stage } from '../components/Stage';
import { SCENE_OPERATOR } from '../data/scenes';
import { sfx } from '../lib/audio';
import type { Shape } from '../lib/mini3d';
import type { Game } from '../hooks/useGame';

const EMBLEM: Record<Difficulty, Shape> = { iniciante: 'cube', intermediario: 'ico', senior: 'knot' };
const DETAILS: Record<Difficulty, string[]> = {
  iniciante: ['10 fases muito fáceis e fáceis', 'Dica automática após 2 min sem escrever', 'Dica ao errar a 1ª tentativa (mostra a solução)', 'Pergunta errada só perde o bônus de XP'],
  intermediario: ['1ª fase fácil, depois nível pleno', 'Dica após 3 min sem escrever', 'Dica ao errar a 2ª tentativa (sem mostrar o resultado)', 'Pergunta errada só perde o bônus de XP'],
  senior: ['10 problemas complexos de algoritmos', 'Nenhuma dica', 'Pergunta errada custa 1 integridade', 'Vale o dobro de XP do iniciante'],
};

/** Escolha da dificuldade (antes do personagem). */
export function DifficultySelect({ game }: { game: Game }) {
  const [focus, setFocus] = useState(Math.max(0, DIFFICULTY_ORDER.indexOf(game.difficulty)));
  const [chosen, setChosen] = useState<Difficulty | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    refs.current[focus]?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (d: Difficulty) => {
    if (chosen || confirmReset) return;
    sfx.success();
    setChosen(d);
    window.setTimeout(() => game.chooseDifficulty(d), 700);
  };

  const newGame = () => {
    sfx.whoosh();
    setConfirmReset(false);
    game.resetAll();
    refs.current[0]?.focus({ preventScroll: true });
    setFocus(0);
  };

  useEffect(() => {
    if (!confirmReset) return;
    const onEsc = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setConfirmReset(false);
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [confirmReset]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const n = (focus + dir + 3) % 3;
    setFocus(n);
    refs.current[n]?.focus();
    sfx.click();
  };

  return (
    <main className="screen">
      <Stage scene={{ ...SCENE_OPERATOR, zoom: 1.6, fx: 70, fy: 30 }} glitchKey="difficulty" className="stage--full levelsel">
        <div className="select__head">
          <h1 className="select__title">NÍVEL DE DIFICULDADE</h1>
          <p className="select__sub">O Operador vai calibrar a simulação para o seu nível. Os desafios e as regras de dica mudam com a escolha.</p>
        </div>

        <div className="diffs" role="radiogroup" aria-label="Dificuldade" onKeyDown={onKey}>
          {DIFFICULTY_ORDER.map((id, i) => {
            const d = DIFFICULTIES[id];
            const done = Math.max(...LANGS.map((l) => game.completedOf(l, id)));
            return (
              <button
                key={id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                role="radio"
                aria-checked={focus === i}
                className={`diff ${chosen === id ? 'is-chosen' : ''} ${chosen && chosen !== id ? 'is-out' : ''}`}
                style={{ '--accent': d.color } as CSSProperties}
                onFocus={() => setFocus(i)}
                onMouseEnter={() => setFocus(i)}
                onClick={() => pick(id)}
              >
                <span className="diff__emblem">
                  <Model3D shape={EMBLEM[id]} color={d.color} look="holo" spin={focus === i ? 1.4 : 0.5} />
                </span>
                <span className="diff__name">{d.label}</span>
                <span className="diff__summary">{d.summary}</span>
                <ul className="diff__rules">
                  {DETAILS[id].map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <span className="diff__xp">até {d.xp} XP por código · perguntas valem bônus</span>
                {done > 0 && (
                  <span className="diff__progress">
                    melhor progresso: {done}/{LEVELS_PER_DIFFICULTY}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="select__foot">
          <button className="link" onClick={game.goHome}>
            [ VOLTAR ]
          </button>
          {game.hasSave && (
            <button
              className="link link--danger"
              onClick={() => {
                sfx.click();
                setConfirmReset(true);
              }}
            >
              [ NOVO JOGO ]
            </button>
          )}
          <span className="select__keys">← → para escolher · Enter para confirmar</span>
        </div>
        {confirmReset && (
          <div className="confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text">
            <div className="confirm__box">
              <h2 id="confirm-title" className="confirm__title">NOVO JOGO?</h2>
              <p id="confirm-text" className="confirm__text">
                Todo o progresso salvo será apagado: fases concluídas, XP e códigos em andamento de todos os heróis, em todas as dificuldades. Não dá para desfazer.
              </p>
              <div className="confirm__actions">
                <button className="link" onClick={() => setConfirmReset(false)} autoFocus>
                  [ CANCELAR ]
                </button>
                <button className="link link--danger" onClick={newGame}>
                  [ APAGAR E COMEÇAR ]
                </button>
              </div>
            </div>
          </div>
        )}
      </Stage>
    </main>
  );
}
