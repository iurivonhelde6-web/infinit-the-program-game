import { useEffect, useState } from 'react';
import { Dialogue, type Line } from '../components/Dialogue';
import { CodeRain } from '../components/CodeRain';
import { Stage } from '../components/Stage';
import { SCENE_BLUE } from '../data/scenes';
import { GAME_SUBTITLE, GAME_TITLE } from '../data/title';
import { music, preloadMusic, sfx, unlock } from '../lib/audio';
import type { Game } from '../hooks/useGame';

/**
 * boot   → tentando tocar a trilha automaticamente
 * gate   → o navegador bloqueou o som: pede um clique para "entrar"
 * rain   → só a chuva de código (a trilha começa aqui)
 * talk   → o INFINIT apresenta as pílulas
 * choose → CHOOSE YOUR DESTINY: o jogador escolhe uma das pílulas
 * blue   → final da pílula azul
 */
type Step = 'boot' | 'gate' | 'rain' | 'talk' | 'choose' | 'blue';

const INFINIT_LINES: Line[] = [
  { speaker: 'INFINIT', tone: 'operator', text: 'Você chegou até aqui. Ainda dá tempo de voltar.' },
  { speaker: 'INFINIT', tone: 'operator', text: 'Pílula azul: você fecha esta janela e tudo continua como sempre foi.' },
  { speaker: 'INFINIT', tone: 'operator', text: 'Pílula vermelha: você descobre o quanto o código vai fundo.' },
];

const BLUE_LINES: Line[] = [
  { speaker: 'NARRADOR', tone: 'narrator', text: 'Você escolheu a pílula azul.' },
  { speaker: 'NARRADOR', tone: 'narrator', text: 'A cidade volta ao normal. Amanhã será só mais um dia comum... e você nunca vai saber o que havia por trás do código.' },
];

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Splash({ game }: { game: Game }) {
  const [step, setStep] = useState<Step>('boot');
  const [picked, setPicked] = useState<'red' | 'blue' | null>(null);

  // Tenta começar a trilha junto com a chuva. Se o navegador bloquear, mostra a tela de entrada.
  useEffect(() => {
    preloadMusic();
    if (game.progress.muted) {
      setStep('rain');
      return;
    }
    let alive = true;
    music.start().then((ok) => alive && setStep(ok ? 'rain' : 'gate'));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Linha do tempo: chuva → fala do INFINIT (a escolha vem quando a fala termina).
  useEffect(() => {
    if (step !== 'rain') return;
    const t = window.setTimeout(() => setStep('talk'), reduceMotion() ? 300 : 2600);
    return () => clearTimeout(t);
  }, [step]);

  const enter = () => {
    unlock();
    void music.start();
    setStep('rain');
  };

  useEffect(() => {
    if (step !== 'gate') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') return;
      e.preventDefault();
      enter();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  const skip = () => {
    if (step === 'rain') setStep('talk');
  };

  const choose = (pill: 'red' | 'blue') => {
    if (step !== 'choose' || picked) return;
    setPicked(pill);
    sfx.pill();
    window.setTimeout(() => {
      if (pill === 'red') game.setPhase('prologue');
      else {
        setPicked(null);
        setStep('blue');
      }
    }, reduceMotion() ? 50 : 900);
  };

  if (step === 'blue') {
    return (
      <main className="screen">
        <Stage scene={SCENE_BLUE} glitchKey="blue" className="stage--full">
          <div className="cine-bars" />
          <div className="screen__dialog">
            <Dialogue key="blue" lines={BLUE_LINES} globalKeys doneLabel="VOLTAR AO DESTINO" onDone={() => setStep('choose')} />
          </div>
        </Stage>
      </main>
    );
  }

  if (step === 'boot' || step === 'gate') {
    return (
      <main className="gate" onClick={step === 'gate' ? enter : undefined}>
        {step === 'gate' && (
          <button className="gate__btn" onClick={enter} autoFocus>
            <span className="gate__line">
              {'>'} ENTRAR NO INFINIT<span className="caret" />
            </span>
            <span className="gate__hint">clique ou pressione qualquer tecla · melhor com som</span>
          </button>
        )}
      </main>
    );
  }

  const talking = step === 'talk';
  const choosing = step === 'choose';

  return (
    <main className={`splash step-${step} ${picked ? `picked-${picked}` : ''}`} onClick={skip}>
      <CodeRain className="splash__rain" />
      <div className="splash__shade" aria-hidden="true" />

      {/* As duas pílulas: aparecem com a fala do INFINIT e viram botões na escolha */}
      <div className={`pills ${talking || choosing ? 'is-on' : ''}`}>
        <button
          className={`pill pill--blue ${choosing ? 'is-live' : ''}`}
          onClick={(e) => (e.stopPropagation(), choose('blue'))}
          disabled={!choosing}
          aria-label="Pílula azul: continuar sonhando"
        >
          <span className="pill__glow" />
          <span className="pill__body" />
          <span className="pill__label">
            <b>BLUE PILL</b>
            <small>continuar sonhando</small>
          </span>
        </button>
        <button
          className={`pill pill--red ${choosing ? 'is-live' : ''}`}
          onClick={(e) => (e.stopPropagation(), choose('red'))}
          disabled={!choosing}
          aria-label="Pílula vermelha: ver a verdade"
        >
          <span className="pill__glow" />
          <span className="pill__body" />
          <span className="pill__label">
            <b>RED PILL</b>
            <small>ver a verdade</small>
          </span>
        </button>
      </div>

      {talking && (
        <div className="screen__dialog">
          <Dialogue key="infinit" lines={INFINIT_LINES} globalKeys doneLabel="ESCOLHER" onDone={() => setStep('choose')} />
        </div>
      )}

      <header className={`splash__logo ${talking || choosing ? 'is-on' : ''}`}>
        <span>{GAME_TITLE}</span> <small>{GAME_SUBTITLE}</small>
      </header>

      <h1 className={`choose ${choosing ? 'is-on' : ''}`} data-text="CHOOSE YOUR DESTINY">
        CHOOSE YOUR DESTINY
      </h1>

      {step === 'rain' && <p className="splash__skip">clique para pular</p>}
      {picked && <div className={`pill-flash pill-flash--${picked}`} aria-hidden="true" />}
    </main>
  );
}
