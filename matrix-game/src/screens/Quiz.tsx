import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Stage } from '../components/Stage';
import { SMITH } from '../data/heroes';
import { QUIZ_HOST, QUIZ_XP } from '../data/questions';
import { LEVEL_SCENES } from '../data/scenes';
import { MAX_LIVES, type Game } from '../hooks/useGame';

const LETTERS = ['A', 'B', 'C', 'D'];

/** Embaralha as alternativas de forma estável (mesma ordem a cada visita da mesma pergunta). */
function shuffled(n: number, seed: number) {
  const idx = Array.from({ length: n }, (_, i) => i);
  let s = seed * 9301 + 49297;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/** Interrogatório: 2 perguntas de múltipla escolha antes do desafio de código. */
export function Quiz({ game }: { game: Game }) {
  const { questions, index, difficulty, hero, lives, quizXp } = game;
  const scene = LEVEL_SCENES[index];
  const host = QUIZ_HOST[index];
  const isSmith = host === 'AGENTE SMITH';
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongKey, setWrongKey] = useState(0);
  const nextRef = useRef<HTMLButtonElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

  const q = questions[qi];
  const order = useMemo(() => shuffled(q.o.length, index * 31 + qi * 7 + difficulty.length), [q, index, qi, difficulty]);
  const answered = picked !== null;
  const correct = picked === q.a;
  const last = qi === questions.length - 1;

  useEffect(() => {
    (answered ? nextRef : firstRef).current?.focus({ preventScroll: true });
  }, [answered, qi]);

  const choose = (opt: number) => {
    if (answered) return;
    setPicked(opt);
    const captured = game.answerQuestion(opt === q.a);
    if (opt !== q.a) setWrongKey(Date.now());
    if (captured) window.setTimeout(game.captureNow, 1400);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (answered) return;
      const k = e.key.toUpperCase();
      const pos = ['1', '2', '3', '4'].indexOf(k) >= 0 ? Number(k) - 1 : LETTERS.indexOf(k);
      if (pos >= 0 && pos < order.length) choose(order[pos]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const advance = () => {
    if (last) game.enterMission();
    else {
      setQi(qi + 1);
      setPicked(null);
    }
  };

  const costs = difficulty === 'senior';

  return (
    <main className="screen">
      <Stage scene={scene} glitchKey={wrongKey || `quiz-${index}`} mood={answered ? (correct ? 'success' : 'danger') : 'none'} className="stage--full quiz">
        {isSmith && (
          <div className="quiz__smith">
            <img src={SMITH.image} alt="" />
          </div>
        )}
        <section className={`px quiz__box ${answered ? (correct ? 'is-right' : 'is-wrong') : ''}`} style={{ '--accent': isSmith ? '#ff4d4d' : host === 'O ARQUITETO' ? '#ffffff' : '#00ff41' } as CSSProperties} aria-live="polite">
          <header className="quiz__head">
            <span className="quiz__host">{host}</span>
            <span className="quiz__meta">
              PERGUNTA {qi + 1}/{questions.length} · +{QUIZ_XP[difficulty]} XP por acerto
            </span>
          </header>
          <div className="quiz__status">
            <span className="cells" role="img" aria-label={`Integridade ${lives} de ${MAX_LIVES}`}>
              {Array.from({ length: MAX_LIVES }, (_, i) => (
                <span key={i} className={`cell ${i < lives ? 'is-on' : ''}`} />
              ))}
            </span>
            <span>{costs ? 'resposta errada custa 1 integridade' : 'resposta errada só perde o bônus de XP'}</span>
            <span className="quiz__xp">bônus: {quizXp} XP</span>
          </div>
          <h1 className="quiz__q" key={`${index}-${qi}`}>
            {q.q}
          </h1>
          <ol className="quiz__opts">
            {order.map((opt, pos) => {
              const state = !answered ? '' : opt === q.a ? 'is-correct' : opt === picked ? 'is-picked' : 'is-dim';
              return (
                <li key={opt}>
                  <button ref={pos === 0 ? firstRef : undefined} className={`opt ${state}`} onClick={() => choose(opt)} disabled={answered}>
                    <span className="opt__key">{LETTERS[pos]}</span>
                    <span className="opt__text">{q.o[opt]}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          {answered && (
            <div className="quiz__answer">
              <p className="quiz__verdict">
                {correct
                  ? `CORRETO. +${QUIZ_XP[difficulty]} XP`
                  : isSmith
                    ? `Errado, Sr. Anderson.${costs ? ' Integridade -1.' : ''}`
                    : `Resposta errada.${costs ? ' Integridade -1.' : ''}`}
              </p>
              <p className="quiz__explain">{q.e}</p>
              {lives > 0 || !costs ? (
                <button ref={nextRef} className="btn btn--primary" onClick={advance}>
                  {last ? 'IR PARA O CÓDIGO ▸' : 'PRÓXIMA PERGUNTA ▸'}
                </button>
              ) : (
                <p className="quiz__explain t-bad">Sua integridade chegou a zero...</p>
              )}
            </div>
          )}
          <p className="quiz__keys">teclas A–D ou 1–4 · {hero.name} · {hero.langLabel}</p>
        </section>
      </Stage>
    </main>
  );
}
