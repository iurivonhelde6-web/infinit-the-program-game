import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { missionText, testsFor } from '../../shared/challenges';
import { CodeEditor } from '../components/CodeEditor';
import { Dialogue, type Line } from '../components/Dialogue';
import { BulbIcon, ChevronIcon, MenuIcon, MuteIcon, PlayIcon, ResetIcon, VolumeIcon } from '../components/Icons';
import { Model3D } from '../components/Model3D';
import { Actor, Stage } from '../components/Stage';
import { Terminal } from '../components/Terminal';
import { Typewriter } from '../components/Typewriter';
import { LINES, SMITH } from '../data/heroes';
import { LEVEL_SCENES } from '../data/scenes';
import { MAX_LIVES, type Game } from '../hooks/useGame';
import { formatValue, LANG_FILE } from '../lib/format';

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Cena de ação: palco do setor + editor e terminal da linguagem do herói. */
export function Mission({ game }: { game: Game }) {
  const { hero, lang, challenge, index, levels, code, lives, hintsUsed, hints, failCount, status, output, lastXp, result, progress, totalXp, maxXp, diff, lastEditAt } = game;
  const scene = LEVEL_SCENES[index];
  const variant = challenge.variants[lang];
  const sector = String(index + 1).padStart(2, '0');
  const brief = useMemo(() => missionText(challenge, lang, hero.name), [challenge, lang, hero.name]);
  const examples = testsFor(challenge, lang).slice(0, 2);
  const isLast = index === levels.length - 1;
  const winLine = hero.wins[index % hero.wins.length];
  const rules = diff.hints;

  // relógio para a contagem da próxima dica por inatividade
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!rules) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [rules]);
  const idleLeft = rules ? lastEditAt + rules.idleMs - now : 0;
  const failsToHint = rules ? Math.max(0, rules.failAt - failCount) : 0;

  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (result && window.innerWidth < 960) stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  const hintLine = (text: string): Line => ({
    speaker: 'OPERADOR',
    tone: 'operator',
    text: `${rules?.kind === 'solution' ? 'Dica (caminho da solução)' : 'Dica'}: ${text}`,
  });

  const failLines: Line[] = [];
  if (result?.kind === 'fail') {
    failLines.push({ speaker: SMITH.name, tone: 'smith', text: LINES.failure });
    failLines.push(
      result.compile
        ? { speaker: SMITH.name, tone: 'smith', text: 'Seu código nem chegou a rodar. Leia o terminal... enquanto ainda pode. (Isso não custou integridade.)' }
        : { speaker: SMITH.name, tone: 'smith', text: `Integridade restante: ${lives} de ${MAX_LIVES}. Quando chegar a zero, você é meu.` },
    );
    if (result.hint) failLines.push(hintLine(result.hint));
  }

  return (
    <div className="mission" style={{ '--accent': hero.color } as CSSProperties}>
      <header className="hud">
        <button className="hud__btn" onClick={game.goSelect} aria-label="Trocar personagem">
          <ChevronIcon size={16} className="flip" />
        </button>
        <img className="hud__face" src={hero.portrait} alt="" />
        <div className="hud__level">
          <span className="hud__label">
            {hero.name} · {hero.langLabel} · <b style={{ color: diff.color }}>{diff.label}</b> · FASE {sector}/{levels.length}
          </span>
          <h1 className="hud__title">{challenge.title}</h1>
        </div>
        <div className="hud__stats">
          <div className="hud__xp" role="progressbar" aria-valuemin={0} aria-valuemax={maxXp} aria-valuenow={totalXp} aria-label="Experiência">
            <span className="hud__label">
              XP {totalXp}/{maxXp}
            </span>
            <span className="bar">
              <span className="bar__fill" style={{ width: `${(totalXp / maxXp) * 100}%` }} />
            </span>
          </div>
          <div className="hud__lives" role="img" aria-label={`Integridade ${lives} de ${MAX_LIVES}`}>
            <span className="hud__label">INTEGRIDADE</span>
            <span className="cells">
              {Array.from({ length: MAX_LIVES }, (_, i) => (
                <span key={i} className={`cell ${i < lives ? 'is-on' : ''}`} />
              ))}
            </span>
          </div>
        </div>
        <button className="hud__btn" onClick={() => game.setMenuOpen(true)} aria-label="Selecionar fase">
          <MenuIcon size={18} />
        </button>
        <button className="hud__btn" onClick={game.toggleMute} aria-label={progress.muted ? 'Ligar som' : 'Desligar som'} aria-pressed={progress.muted}>
          {progress.muted ? <MuteIcon size={18} /> : <VolumeIcon size={18} />}
        </button>
      </header>

      <div className="mission__grid">
        <section className="mission__left" aria-label="Cena">
          <div ref={stageRef} className="mission__stage">
            <Stage scene={scene} glitchKey={`${hero.id}-${index}`} caption={`FASE ${sector} · ${scene.name}`} mood={result?.kind === 'fail' ? 'danger' : result?.kind === 'success' ? 'success' : 'none'}>
              <div className={`holo ${scene.heroX > 50 ? 'is-left' : 'is-right'}`}>
                <Model3D shape={scene.mesh} color={scene.meshColor} look="holo" spin={status === 'running' ? 3 : 0.7} />
                <span className="holo__label">{status === 'running' ? (lang === 'java' ? 'COMPILANDO…' : 'EXECUTANDO…') : `NÚCLEO ${sector}`}</span>
              </div>
              <Actor
                key={`${hero.id}-${index}`}
                src={hero.sprite}
                alt={hero.name}
                x={scene.heroX}
                height={84}
                flip={scene.flip}
                enter="glitch"
                glow={result?.kind === 'success' ? hero.color : undefined}
                className={result?.kind === 'fail' ? 'is-hurt' : ''}
              />

              {result?.kind === 'success' && (
                <>
                  <div className="cut cut--hero" key={`s${result.key}`}>
                    <img src={hero.portrait} alt={hero.name} />
                  </div>
                  <div className="stage__dialog">
                    <Dialogue
                      key={result.key}
                      compact
                      lines={[
                        { speaker: 'OPERADOR', tone: 'operator', text: `${LINES.success(hero.name)} +${lastXp} XP` },
                        { speaker: hero.name, tone: 'hero', portrait: hero.portrait, color: hero.color, text: winLine },
                      ]}
                      doneLabel={isLast ? 'FINALIZAR' : 'PRÓXIMA FASE'}
                      onDone={game.next}
                    />
                  </div>
                </>
              )}

              {result?.kind === 'fail' && (
                <>
                  <div className="cut cut--smith" key={`f${result.key}`}>
                    <img src={SMITH.image} alt={SMITH.name} />
                  </div>
                  <div className="stage__dialog">
                    <Dialogue key={result.key} compact lines={failLines} doneLabel="TENTAR DE NOVO" onDone={game.dismissResult} />
                  </div>
                </>
              )}

              {result?.kind === 'hint' && result.hint && (
                <div className="stage__dialog">
                  <Dialogue
                    key={result.key}
                    compact
                    lines={[
                      { speaker: 'OPERADOR', tone: 'operator', text: `${hero.name}, você está parado há ${Math.round((rules?.idleMs ?? 0) / 60000)} minutos. Vou te ajudar.` },
                      hintLine(result.hint),
                    ]}
                    doneLabel="VOLTAR AO CÓDIGO"
                    onDone={game.dismissResult}
                  />
                </div>
              )}
            </Stage>
          </div>

          <div className="brief">
            <section className="px card" aria-label="Missão">
              <h2 className="card__head">
                <span>OPERADOR</span>
                <span className="card__file">{LANG_FILE[lang]}</span>
              </h2>
              <p className="card__text">
                <Typewriter key={`${lang}-${challenge.id}`} text={brief} />
              </p>
              {variant.note && <p className="card__note">{variant.note}</p>}
              <ul className="examples" aria-label="Exemplos">
                {examples.map((t, i) => (
                  <li key={i}>
                    <code>
                      {variant.fn}({t.input.map((v) => formatValue(lang, v)).join(', ')}) <b>→</b> {formatValue(lang, t.expected)}
                    </code>
                  </li>
                ))}
              </ul>
            </section>

            <section className="px card" aria-label="Dicas" style={{ '--accent': diff.color } as CSSProperties}>
              <div className="hints__head">
                <h2 className="card__head card__head--flat">
                  <BulbIcon size={14} /> DICAS · {diff.label}
                </h2>
                {rules && <span className="hints__count">{hintsUsed}/{hints.length}</span>}
              </div>
              {!rules ? (
                <p className="card__small hints__none">Nível Sênior: sem dicas. Só você e o código.</p>
              ) : (
                <>
                  <p className="t-dim card__small">{diff.rules}</p>
                  {hintsUsed < hints.length && status !== 'success' && (
                    <p className="hints__timer">
                      Próxima dica em <b>{mmss(idleLeft)}</b> sem digitar
                      {failsToHint > 0 ? ` ou ao errar mais ${failsToHint} vez${failsToHint > 1 ? 'es' : ''}` : ' ou no próximo erro'}.
                    </p>
                  )}
                  {hintsUsed > 0 && (
                    <ol className="hints">
                      {hints.slice(0, hintsUsed).map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ol>
                  )}
                  <p className="t-dim card__small">Cada dica revelada reduz {Math.round(diff.xp / 4)} XP do código desta fase.</p>
                </>
              )}
            </section>

            {status === 'success' && !result && (
              <button className="btn btn--block btn--primary" onClick={game.next}>
                {isLast ? 'FINALIZAR' : 'PRÓXIMA FASE'} <ChevronIcon size={14} />
              </button>
            )}
          </div>
        </section>

        <section className="mission__right" aria-label="Código">
          <CodeEditor value={code} onChange={game.changeCode} onRun={game.run} lang={lang} fileName={LANG_FILE[lang]} />
          <div className="actions">
            <span className="actions__tip t-dim">
              {lang === 'javascript' ? 'Roda no navegador' : lang === 'java' ? 'javac + JVM no servidor' : 'CPython no servidor'} · Ctrl + Enter executa
            </span>
            <button className="btn btn--small" onClick={game.resetCode}>
              <ResetIcon size={14} /> RESETAR
            </button>
            <button className="btn btn--primary" onClick={game.run} disabled={status === 'running'}>
              {status === 'running' ? (
                lang === 'java' ? 'COMPILANDO...' : 'EXECUTANDO...'
              ) : (
                <>
                  <PlayIcon size={14} /> {lang === 'java' ? 'COMPILAR E EXECUTAR' : 'EXECUTAR'}
                </>
              )}
            </button>
          </div>
          <Terminal output={output} status={status} lang={lang} />
        </section>
      </div>
    </div>
  );
}
