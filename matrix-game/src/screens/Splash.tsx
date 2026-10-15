import { useEffect, useState } from 'react';
import { Dialogue } from '../components/Dialogue';
import { MatrixRain } from '../components/MatrixRain';
import { Stage } from '../components/Stage';
import { SCENE_BLUE } from '../data/scenes';
import { GAME_SUBTITLE, GAME_TITLE } from '../data/title';
import { music, preloadMusic, sfx, unlock } from '../lib/audio';
import type { Game } from '../hooks/useGame';

/**
 * boot   → tentando tocar a trilha automaticamente
 * gate   → o navegador bloqueou o som: pede um clique para "entrar"
 * rain   → só a chuva de código (a trilha começa aqui)
 * poster → transição suave para o Morpheus em tela cheia
 * choose → CHOOSE YOUR DESTINY: o jogador escolhe a pílula nas mãos dele
 * blue   → final da pílula azul
 */
type Step = 'boot' | 'gate' | 'rain' | 'poster' | 'choose' | 'blue';

const BLUE_LINES = [
  { speaker: 'NARRADOR', tone: 'narrator' as const, text: 'Você escolheu a pílula azul.' },
  { speaker: 'NARRADOR', tone: 'narrator' as const, text: 'A cidade volta ao normal. Amanhã será só mais um dia comum... e você nunca vai saber o que havia por trás do código.' },
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

  // Linha do tempo: chuva → pôster → escolha.
  useEffect(() => {
    if (step !== 'rain' && step !== 'poster') return;
    const fast = reduceMotion();
    const t = window.setTimeout(() => setStep(step === 'rain' ? 'poster' : 'choose'), fast ? 300 : step === 'rain' ? 2600 : 2400);
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
    if (step === 'rain' || step === 'poster') setStep('choose');
  };

  const choose = (pill: 'red' | 'blue') => {
    if (step !== 'choose' || picked) return;
    setPicked(pill);
    sfx.pill();
    window.setTimeout(() => {
      if (pill === 'red') game.setPhase('difficulty');
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
              {'>'} ENTRAR NA MATRIX<span className="caret" />
            </span>
            <span className="gate__hint">clique ou pressione qualquer tecla · melhor com som</span>
          </button>
        )}
      </main>
    );
  }

  const posterOn = step === 'poster' || step === 'choose';
  const choosing = step === 'choose';

  return (
    <main className={`splash step-${step} ${picked ? `picked-${picked}` : ''}`} onClick={skip}>
      <MatrixRain className="splash__rain" />

      <div className={`destiny ${posterOn ? 'is-on' : ''}`}>
        {/* Fundo desfocado da própria imagem: preenche a tela em monitores largos */}
        <div className="destiny__backdrop" style={{ backgroundImage: 'url(/assets/poster.webp)' }} aria-hidden="true" />

        <div className="destiny__art">
          <img className="destiny__img" src="/assets/poster.webp" alt="Morpheus oferece uma pílula azul na mão direita e uma vermelha na esquerda, com código verde caindo" draggable={false} />
          <span className="destiny__glint destiny__glint--l" aria-hidden="true" />
          <span className="destiny__glint destiny__glint--r" aria-hidden="true" />

        </div>

        <div className="destiny__rain" aria-hidden="true">
          <MatrixRain mode="overlay" fontSize={15} density={0.45} speed={1} />
        </div>
        <div className="destiny__shade" aria-hidden="true" />

        {/* Mesma geometria da arte, mas acima da chuva e da sombra: as pílulas nas mãos são os botões */}
        <div className="destiny__hits">
          <button
            className={`hand hand--blue ${choosing ? 'is-live' : ''}`}
            onClick={(e) => (e.stopPropagation(), choose('blue'))}
            disabled={!choosing}
            aria-label="Pílula azul: continuar sonhando"
          >
            <span className="hand__glow" />
            <span className="hand__label">
              <b>BLUE PILL</b>
              <small>continuar sonhando</small>
            </span>
          </button>
          <button
            className={`hand hand--red ${choosing ? 'is-live' : ''}`}
            onClick={(e) => (e.stopPropagation(), choose('red'))}
            disabled={!choosing}
            aria-label="Pílula vermelha: ver a verdade"
          >
            <span className="hand__glow" />
            <span className="hand__label">
              <b>RED PILL</b>
              <small>ver a verdade</small>
            </span>
          </button>
        </div>
      </div>

      <header className={`splash__logo ${choosing ? 'is-on' : ''}`}>
        <span>{GAME_TITLE}</span> <small>{GAME_SUBTITLE}</small>
      </header>

      <h1 className={`choose ${choosing ? 'is-on' : ''}`} data-text="CHOOSE YOUR DESTINY">
        CHOOSE YOUR DESTINY
      </h1>

      {!choosing && <p className="splash__skip">clique para pular</p>}
      {picked && <div className={`pill-flash pill-flash--${picked}`} aria-hidden="true" />}
    </main>
  );
}
