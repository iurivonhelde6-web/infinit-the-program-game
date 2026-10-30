import { Dialogue } from '../components/Dialogue';
import { Model3D } from '../components/Model3D';
import { Actor, Stage } from '../components/Stage';
import { CHAPTERS } from '../data/chapters';
import { LEVEL_SCENES } from '../data/scenes';
import type { Game } from '../hooks/useGame';

/** Capítulo da história antes de cada fase: a cena da fase + a continuação da narrativa. */
export function Chapter({ game }: { game: Game }) {
  const { hero, index, challenge, diff } = game;
  const scene = LEVEL_SCENES[index];
  const chapter = CHAPTERS[index];
  const n = String(index + 1).padStart(2, '0');

  return (
    <main className="screen">
      <Stage scene={scene} glitchKey={`chapter-${index}`} className="stage--full chapter">
        <div className={`holo holo--big ${scene.heroX > 50 ? 'is-left' : 'is-right'}`}>
          <Model3D shape={scene.mesh} color={scene.meshColor} look="holo" spin={0.8} />
        </div>
        <Actor key={`${hero.id}-${index}`} src={hero.sprite} alt={hero.name} x={scene.heroX} height={78} flip={scene.flip} enter="glitch" />
        <div className="cine-bars" />
        <header className="chapter__card" key={index}>
          <span className="chapter__num">
            CAPÍTULO {n} · {diff.label}
          </span>
          <h1 className="chapter__title">{chapter.title}</h1>
          <span className="chapter__place">
            {scene.name} — {challenge.title}
          </span>
        </header>
        <div className="screen__dialog">
          <Dialogue key={`${hero.id}-${index}`} lines={chapter.lines(hero)} globalKeys doneLabel="CONTINUAR" onDone={game.finishChapter} />
        </div>
        <button className="skip" onClick={game.finishChapter}>
          PULAR CENA ▸▸
        </button>
      </Stage>
    </main>
  );
}
