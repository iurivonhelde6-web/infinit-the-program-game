import type { CSSProperties } from 'react';
import { Model3D } from '../components/Model3D';
import { Actor, Stage } from '../components/Stage';
import { HEROES } from '../data/heroes';
import { SCENE_FINAL } from '../data/scenes';
import type { Game } from '../hooks/useGame';

function rank(ratio: number) {
  if (ratio >= 0.9) return { name: 'O ESCOLHIDO', note: 'Você viu o código sem ajuda. Nem o Arquiteto esperava por isso.' };
  if (ratio >= 0.6) return { name: 'OPERADOR', note: 'Você guia os outros pelo INFINIT. Falta pouco para dobrar a realidade.' };
  return { name: 'RECRUTA', note: 'Você sobreviveu. Refaça as fases com menos erros e dicas para subir de patente.' };
}

export function Outro({ game }: { game: Game }) {
  const { hero, totalXp, maxXp, diff, levels } = game;
  const r = rank(totalXp / maxXp);
  // Epílogo: cada herói que vence as fases desta dificuldade recupera um pedaço da condição de parada.
  const pieces = HEROES.map((h) => ({ hero: h, found: game.completedOf(h.lang) === levels.length }));
  const found = pieces.filter((p) => p.found).length;

  return (
    <main className="screen">
      <Stage scene={SCENE_FINAL} glitchKey="outro" mood="success" className="stage--full outro">
        <div className="outro__emblem">
          <Model3D shape={hero.emblem} color={hero.color} look="both" spin={0.8} />
        </div>
        <Actor src={hero.sprite} alt={hero.name} x={24} height={88} enter="rise" glow={hero.color} />
        <section className="px outro__card" aria-labelledby="outro-title" style={{ '--accent': hero.color } as CSSProperties}>
          <h1 id="outro-title" className="outro__title">
            SISTEMA INVADIDO
          </h1>
          <p className="outro__text">
            {hero.name} concluiu as {levels.length} fases do nível {diff.label} em {hero.langLabel}. A simulação está agora sob seu controle.
          </p>
          <dl className="outro__stats">
            <div>
              <dt>PATENTE</dt>
              <dd className="outro__rank">{r.name}</dd>
            </div>
            <div>
              <dt>XP · {diff.label}</dt>
              <dd>
                {totalXp} / {maxXp}
              </dd>
            </div>
          </dl>
          <p className="outro__note">{r.note}</p>
          <div className="outro__halt" aria-label="Condição de parada">
            <p className="outro__halt-head">
              CONDIÇÃO DE PARADA · {found}/{pieces.length}
            </p>
            <ul>
              {pieces.map(({ hero: h, found: ok }) => (
                <li key={h.id} className={ok ? 'is-found' : ''} style={{ '--accent': h.color } as CSSProperties}>
                  <b>{h.name}</b> {ok ? h.fragment : '??? ainda em loop'}
                </li>
              ))}
            </ul>
            <p className="outro__halt-text">
              {found === pieces.length
                ? 'Os três pedaços se encaixam. while (true) encontra o seu break: o loop do INFINIT se encerra.'
                : `${hero.name} encontrou o seu pedaço. Os outros ainda precisam vencer o loop para encerrar o INFINIT.`}
            </p>
          </div>
          <div className="outro__actions">
            <button className="btn btn--primary" onClick={game.goSelect}>
              OUTRO PERSONAGEM
            </button>
            <button className="btn" onClick={game.goDifficulty}>
              OUTRA DIFICULDADE
            </button>
            <button className="btn" onClick={() => game.setMenuOpen(true)}>
              REVER FASES
            </button>
            <button className="btn" onClick={game.goHome}>
              INÍCIO
            </button>
          </div>
        </section>
      </Stage>
    </main>
  );
}
