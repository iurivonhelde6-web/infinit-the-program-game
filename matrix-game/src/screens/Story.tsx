import { useMemo, useState } from 'react';
import { Dialogue, type Line } from '../components/Dialogue';
import { Model3D } from '../components/Model3D';
import { Actor, Stage } from '../components/Stage';
import { SCENE_OPERATOR, SCENE_STREET_GLITCH, SCENE_STREET_GREEN, SCENE_STREET_NIGHT, type SceneDef } from '../data/scenes';
import type { Game } from '../hooks/useGame';

type Beat = { scene: SceneDef; actor: { x: number; h: number; enter: 'fade' | 'left' | 'glitch' | 'rise' }; line: Line; emblem?: boolean };

/** Cena de abertura do personagem: a cidade "real" à noite é invadida pelo código da Matrix. */
export function Story({ game }: { game: Game }) {
  const { hero } = game;
  const [beat, setBeat] = useState(0);

  const beats = useMemo<Beat[]>(
    () => [
      {
        scene: SCENE_STREET_NIGHT,
        actor: { x: 20, h: 44, enter: 'left' },
        line: { speaker: 'NARRADOR', tone: 'narrator', text: 'Mais uma noite na cidade. Luzes acesas, carros passando, gente apressada... Tudo parece real demais.' },
      },
      {
        scene: SCENE_STREET_GLITCH,
        actor: { x: 30, h: 60, enter: 'fade' },
        line: { speaker: hero.name, tone: 'hero', portrait: hero.portrait, color: hero.color, text: hero.storyA },
      },
      {
        scene: SCENE_STREET_GREEN,
        actor: { x: 34, h: 70, enter: 'glitch' },
        line: { speaker: 'NARRADOR', tone: 'narrator', text: 'Então a ilusão se desfaz. Cada prédio, cada carro, cada gota de chuva... tudo é código.' },
      },
      {
        scene: { ...SCENE_STREET_GREEN, zoom: 1.6, fx: 46, fy: 60 },
        actor: { x: 38, h: 90, enter: 'rise' },
        line: { speaker: hero.name, tone: 'hero', portrait: hero.portrait, color: hero.color, text: hero.storyB },
        emblem: true,
      },
      {
        scene: SCENE_OPERATOR,
        actor: { x: 24, h: 84, enter: 'glitch' },
        line: {
          speaker: 'OPERADOR',
          tone: 'operator',
          text: `Conexão estabelecida, ${hero.name}. Seu terminal ${hero.langLabel} está online. Dez setores da Matrix esperam por você. Carregando a primeira missão...`,
        },
        emblem: true,
      },
    ],
    [hero],
  );

  const b = beats[beat];

  return (
    <main className="screen">
      <Stage scene={b.scene} glitchKey={beat === 1 || beat === 2 || beat === 4 ? beat : undefined} className="stage--full story">
        {b.emblem && (
          <div className="story__emblem">
            <Model3D shape={hero.emblem} color={hero.color} look="holo" spin={1} />
            <span>{hero.langLabel}</span>
          </div>
        )}
        <Actor key={`${hero.id}-${beat}`} src={hero.sprite} alt={hero.name} x={b.actor.x} height={b.actor.h} enter={b.actor.enter} glow={beat >= 2 ? hero.color : undefined} />
        <div className="cine-bars" />
        <div className="screen__dialog">
          <Dialogue key={hero.id} lines={beats.map((x) => x.line)} onLine={setBeat} globalKeys doneLabel="ENTRAR NA MATRIX" onDone={game.finishStory} />
        </div>
        <button className="skip" onClick={game.finishStory}>
          PULAR CENA ▸▸
        </button>
      </Stage>
    </main>
  );
}
