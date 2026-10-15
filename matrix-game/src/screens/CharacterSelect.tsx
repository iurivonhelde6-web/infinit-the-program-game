import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Model3D } from '../components/Model3D';
import { Stage } from '../components/Stage';
import { HEROES, type HeroId } from '../data/heroes';
import { SCENE_SELECT } from '../data/scenes';
import { sfx } from '../lib/audio';
import type { Game } from '../hooks/useGame';

/** Seleção de personagem na cidade da Matrix: cada herói representa uma linguagem. */
export function CharacterSelect({ game }: { game: Game }) {
  const [focus, setFocus] = useState(1);
  const [chosen, setChosen] = useState<HeroId | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const { server } = game;

  useEffect(() => {
    refs.current[1]?.focus({ preventScroll: true });
  }, []);

  const pick = (id: HeroId) => {
    if (chosen) return;
    sfx.success();
    setChosen(id);
    window.setTimeout(() => game.pickHero(id), 900);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const n = (focus + (e.key === 'ArrowRight' ? 1 : HEROES.length - 1)) % HEROES.length;
      setFocus(n);
      refs.current[n]?.focus();
      sfx.click();
    }
  };

  const offline = server && HEROES.filter((h) => h.lang !== 'javascript' && !server.languages[h.lang]).map((h) => h.langLabel);

  return (
    <main className="screen">
      <Stage scene={SCENE_SELECT} glitchKey="select" className="stage--full select">
        <div className="select__head">
          <h1 className="select__title">ESCOLHA SEU PERSONAGEM</h1>
          <button className="select__diff" style={{ color: game.diff.color, borderColor: game.diff.color }} onClick={game.goDifficulty}>
            DIFICULDADE: {game.diff.label} · trocar
          </button>
          <p className="select__sub">Cada um domina uma linguagem. Seus desafios serão compilados e executados nela.</p>
          {offline && offline.length > 0 && (
            <p className="select__warn" role="status">
              ⚠ Compilador {offline.join(' e ')} offline — rode <code>npm run dev</code> ou <code>npm start</code> para jogar com esses personagens.
            </p>
          )}
        </div>

        <div className="select__row" role="radiogroup" aria-label="Personagens" onKeyDown={onKey}>
          {HEROES.map((h, i) => {
            const done = game.completedOf(h.lang);
            return (
              <button
                key={h.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                role="radio"
                aria-checked={focus === i}
                className={`hero ${chosen === h.id ? 'is-chosen' : ''} ${chosen && chosen !== h.id ? 'is-out' : ''}`}
                style={{ '--accent': h.color } as CSSProperties}
                onFocus={() => setFocus(i)}
                onMouseEnter={() => setFocus(i)}
                onClick={() => pick(h.id)}
              >
                <span className="hero__emblem">
                  <Model3D shape={h.emblem} color={h.color} look="holo" spin={focus === i ? 1.4 : 0.5} />
                </span>
                <span className="hero__figure">
                  <img className="hero__sprite" src={h.sprite} alt="" draggable={false} />
                  <img className="hero__reflect" src={h.sprite} alt="" aria-hidden="true" draggable={false} />
                </span>
                <span className="hero__face">
                  <img src={h.portrait} alt="" />
                </span>
                <span className="hero__plate">
                  <span className="hero__name">{h.name}</span>
                  <span className="hero__lang">{h.langLabel}</span>
                  <span className="hero__tag">{h.tagline}</span>
                  <span className="hero__traits">{h.traits}</span>
                  <span className="hero__progress">
                    <span className="bar">
                      <span className="bar__fill" style={{ width: `${(done / game.levels.length) * 100}%` }} />
                    </span>
                    {done}/{game.levels.length}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="select__foot">
          <button className="link" onClick={game.goDifficulty}>
            [ VOLTAR ]
          </button>
          <span className="select__keys">← → para escolher · Enter para confirmar</span>
        </div>
      </Stage>
    </main>
  );
}
