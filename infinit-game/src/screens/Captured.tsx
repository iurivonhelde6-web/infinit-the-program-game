import { Dialogue } from '../components/Dialogue';
import { Stage } from '../components/Stage';
import { LINES, SMITH, smithSays } from '../data/heroes';
import { SCENE_SMITH } from '../data/scenes';
import type { Game } from '../hooks/useGame';

/** Integridade zerada: o Agente Smith captura o jogador. */
export function Captured({ game }: { game: Game }) {
  return (
    <main className="screen">
      <Stage scene={SCENE_SMITH} glitchKey="captured" mood="danger" className="stage--full captured">
        <div className="captured__smith">
          <img src={SMITH.image} alt={SMITH.name} />
        </div>
        <div className="cine-bars" />
        <div className="screen__dialog">
          <Dialogue
            key="captured"
            globalKeys
            lines={[
              { speaker: SMITH.name, tone: 'smith', text: smithSays(game.hero.id, LINES.captured, true) },
              { speaker: 'OPERADOR', tone: 'operator', text: `Perdemos o sinal de ${game.hero.name}... Reconectando à fase ${String(game.index + 1).padStart(2, '0')}. Seu progresso foi preservado.${game.quizDone ? '' : ' O interrogatório vai recomeçar.'}` },
            ]}
            doneLabel="TENTAR DE NOVO"
            onDone={game.retryLevel}
          />
        </div>
        <button className="skip" onClick={game.goSelect}>
          TROCAR PERSONAGEM
        </button>
      </Stage>
    </main>
  );
}
