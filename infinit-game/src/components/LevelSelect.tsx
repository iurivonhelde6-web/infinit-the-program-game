import { useEffect, useRef } from 'react';
import { LEVEL_SCENES } from '../data/scenes';
import { CHAPTERS } from '../data/chapters';
import { levelMaxXp, type Game } from '../hooks/useGame';
import { CheckIcon, LockIcon, PlayIcon } from './Icons';

export function LevelSelect({ game }: { game: Game }) {
  const { heroProgress, nextIndex, startLevel, setMenuOpen, hero, resetHero, levels, diff, difficulty } = game;
  const firstRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(document.activeElement);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    const restore = opener.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      if (restore instanceof HTMLElement) restore.focus();
    };
  }, [setMenuOpen]);

  return (
    <div className="modal" onClick={() => setMenuOpen(false)}>
      <div className="px modal__box" role="dialog" aria-modal="true" aria-labelledby="levels-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="levels-title" className="modal__title">
          FASES · {hero.name} ({hero.langLabel}) · {diff.label}
        </h2>
        <ol className="levels">
          {levels.map((c, i) => {
            const done = heroProgress.completed[c.id];
            const unlocked = i === 0 || !!heroProgress.completed[levels[i - 1].id];
            const current = i === nextIndex && !done;
            return (
              <li key={c.id}>
                <button
                  ref={i === nextIndex ? firstRef : undefined}
                  className={`level ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`}
                  disabled={!unlocked}
                  onClick={() => startLevel(i)}
                >
                  <span className="level__icon">{done ? <CheckIcon size={16} /> : unlocked ? <PlayIcon size={14} /> : <LockIcon size={16} />}</span>
                  <span className="level__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="level__name">
                    {c.title}
                    <small>
                      CAP. {i + 1} · {CHAPTERS[i].title} · {LEVEL_SCENES[i].name}
                    </small>
                  </span>
                  <span className="level__xp">{done ? `${done.xp}/${levelMaxXp(difficulty)} XP` : unlocked ? 'LIVRE' : 'BLOQUEADO'}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="modal__actions">
          <button className="btn btn--small" onClick={() => setMenuOpen(false)}>
            FECHAR
          </button>
          <button className="link link--danger" onClick={() => window.confirm(`Apagar o progresso de ${hero.name}?`) && resetHero()}>
            [ APAGAR PROGRESSO DE {hero.name} ]
          </button>
        </div>
      </div>
    </div>
  );
}
