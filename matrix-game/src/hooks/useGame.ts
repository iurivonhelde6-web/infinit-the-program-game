import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CHALLENGES, DIFFICULTIES, hintsFor, starterCode, type Difficulty, type Lang } from '../../shared/challenges';
import { heroById, type HeroId } from '../data/heroes';
import { QUESTIONS, QUIZ_XP } from '../data/questions';
import { music, setMuted as setAudioMuted, sfx, unlock } from '../lib/audio';
import { checkServer, runCode, type RunResult, type ServerStatus } from '../lib/runner';
import { clearProgress, emptyProgress, hasSavedGame, loadProgress, saveProgress, type HeroProgress, type Progress } from '../lib/storage';

export type Phase = 'splash' | 'difficulty' | 'select' | 'story' | 'chapter' | 'quiz' | 'mission' | 'captured' | 'outro';
export type Status = 'idle' | 'running' | 'success' | 'error';
/** Cena que aparece no palco da missão: acerto, erro (Smith) ou dica por inatividade (Operador). */
export type ResultScene = { kind: 'success' | 'fail' | 'hint'; key: number; compile: boolean; hint?: string } | null;

export const MAX_LIVES = 3;

/** XP máximo de uma fase: código + bônus das duas perguntas. */
export const levelMaxXp = (d: Difficulty) => DIFFICULTIES[d].xp + 2 * QUIZ_XP[d];

export function useGame() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [phase, setPhase] = useState<Phase>('splash');
  const [heroId, setHeroId] = useState<HeroId>('neo');
  const [index, setIndex] = useState(0);
  const [code, setCode] = useState('');
  const [lives, setLives] = useState(MAX_LIVES);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [quizXp, setQuizXp] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [output, setOutput] = useState<RunResult | null>(null);
  const [lastXp, setLastXp] = useState(0);
  const [result, setResult] = useState<ResultScene>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [server, setServer] = useState<ServerStatus | null>(null);
  /** Momento da última digitação (ou do início da missão): base das dicas por inatividade. */
  const [lastEditAt, setLastEditAt] = useState(() => Date.now());
  const runningRef = useRef(false);

  const difficulty = progress.difficulty;
  const diff = DIFFICULTIES[difficulty];
  const hero = heroById(heroId);
  const lang = hero.lang;
  const levels = CHALLENGES[difficulty];
  const challenge = levels[index];
  const heroProgress = progress.runs[difficulty][lang];
  const hints = useMemo(() => (diff.hints ? hintsFor(challenge, lang) : []), [diff, challenge, lang]);
  const questions = QUESTIONS[difficulty][index];

  const completedOf = useCallback((l: Lang, d: Difficulty = difficulty) => CHALLENGES[d].filter((c) => progress.runs[d][l].completed[c.id]).length, [progress, difficulty]);
  const completedCount = completedOf(lang);
  const totalXp = levels.reduce((s, c) => s + (heroProgress.completed[c.id]?.xp ?? 0), 0);
  const maxXp = levels.length * levelMaxXp(difficulty);

  const nextIndex = useMemo(() => {
    const i = levels.findIndex((c) => !heroProgress.completed[c.id]);
    return i === -1 ? levels.length - 1 : i;
  }, [levels, heroProgress.completed]);

  useEffect(() => {
    const t = window.setTimeout(() => saveProgress(progress), 300);
    return () => clearTimeout(t);
  }, [progress]);

  useEffect(() => {
    checkServer().then(setServer);
  }, []);

  // Som: aplica o mudo salvo e garante a trilha após o primeiro gesto (caso o autoplay tenha sido bloqueado).
  useEffect(() => {
    setAudioMuted(progress.muted);
    const start = () => {
      unlock();
      void music.start();
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = useCallback(() => {
    const muted = !progress.muted;
    setAudioMuted(muted);
    if (!muted) {
      unlock();
      void music.start();
      sfx.click();
    }
    setProgress((p) => ({ ...p, muted }));
  }, [progress.muted]);

  const updateRun = useCallback(
    (fn: (h: HeroProgress) => HeroProgress) =>
      setProgress((p) => ({ ...p, runs: { ...p.runs, [difficulty]: { ...p.runs[difficulty], [lang]: fn(p.runs[difficulty][lang]) } } })),
    [difficulty, lang],
  );

  // ───────────── fluxo entre telas ─────────────

  const chooseDifficulty = useCallback((d: Difficulty) => {
    setProgress((p) => ({ ...p, difficulty: d }));
    setPhase('select');
  }, []);

  const resetLevelState = useCallback(() => {
    setLives(MAX_LIVES);
    setHintsUsed(0);
    setFailCount(0);
    setStatus('idle');
    setOutput(null);
    setResult(null);
  }, []);

  /** Começa uma fase pelo capítulo da história. */
  const beginLevel = useCallback(
    (i: number) => {
      const c = levels[i];
      setIndex(i);
      setCode(progress.runs[difficulty][lang].drafts[c.id] ?? starterCode(c, lang));
      resetLevelState();
      setQuizXp(0);
      setQuizDone(false);
      setMenuOpen(false);
      setPhase('chapter');
    },
    [levels, progress, difficulty, lang, resetLevelState],
  );

  const pickHero = useCallback(
    (id: HeroId) => {
      setHeroId(id);
      const l = heroById(id).lang;
      const started = CHALLENGES[difficulty].some((c) => progress.runs[difficulty][l].completed[c.id]);
      setPhase(started ? 'chapter' : 'story');
      if (started) {
        const i = CHALLENGES[difficulty].findIndex((c) => !progress.runs[difficulty][l].completed[c.id]);
        const idx = i === -1 ? CHALLENGES[difficulty].length - 1 : i;
        const c = CHALLENGES[difficulty][idx];
        setIndex(idx);
        setCode(progress.runs[difficulty][l].drafts[c.id] ?? starterCode(c, l));
        resetLevelState();
        setQuizXp(0);
        setQuizDone(false);
      }
    },
    [difficulty, progress, resetLevelState],
  );

  const finishStory = useCallback(() => beginLevel(nextIndex), [beginLevel, nextIndex]);
  const finishChapter = useCallback(() => setPhase('quiz'), []);

  const enterMission = useCallback(() => {
    setQuizDone(true);
    setLastEditAt(Date.now());
    setPhase('mission');
  }, []);

  /** Registra a resposta de uma pergunta. Retorna se o jogador foi capturado. */
  const answerQuestion = useCallback(
    (correct: boolean) => {
      if (correct) {
        sfx.success();
        setQuizXp((x) => x + QUIZ_XP[difficulty]);
        return false;
      }
      sfx.failure();
      // Só no Sênior a pergunta errada custa integridade; nos outros níveis perde-se apenas o bônus de XP
      // (assim a dica do 2º erro no Intermediário sempre chega antes da captura).
      if (difficulty !== 'senior') return false;
      const left = lives - 1;
      setLives(left);
      return left <= 0;
    },
    [difficulty, lives],
  );

  const captureNow = useCallback(() => {
    setStatus('idle');
    setPhase('captured');
  }, []);

  /** Depois de capturado: volta para a pergunta (se ainda não respondeu) ou direto para o código. */
  const retryLevel = useCallback(() => {
    resetLevelState();
    if (quizDone) {
      setLastEditAt(Date.now());
      setPhase('mission');
    } else {
      setQuizXp(0);
      setPhase('quiz');
    }
  }, [quizDone, resetLevelState]);

  const goSelect = useCallback(() => {
    setMenuOpen(false);
    setResult(null);
    setPhase('select');
  }, []);

  const goDifficulty = useCallback(() => {
    setMenuOpen(false);
    setResult(null);
    setPhase('difficulty');
  }, []);

  const goHome = useCallback(() => {
    setMenuOpen(false);
    setResult(null);
    setPhase('splash');
  }, []);

  // ───────────── missão ─────────────

  const changeCode = useCallback(
    (value: string) => {
      setCode(value);
      setLastEditAt(Date.now());
      const id = levels[index].id;
      updateRun((h) => ({ ...h, drafts: { ...h.drafts, [id]: value } }));
    },
    [levels, index, updateRun],
  );

  const resetCode = useCallback(() => {
    sfx.click();
    changeCode(starterCode(challenge, lang));
    setOutput(null);
    setStatus('idle');
  }, [challenge, lang, changeCode]);

  /** Revela a próxima dica (se a dificuldade tiver dicas). Retorna o texto revelado. */
  const revealHint = useCallback((): string | undefined => {
    if (!diff.hints || hintsUsed >= hints.length) return undefined;
    sfx.hint();
    setHintsUsed(hintsUsed + 1);
    return hints[hintsUsed];
  }, [diff, hints, hintsUsed]);

  // Dica por inatividade: X minutos sem digitar (2 min no iniciante, 3 min no intermediário).
  const idleMs = diff.hints?.idleMs ?? 0;
  useEffect(() => {
    if (phase !== 'mission' || !idleMs || hintsUsed >= hints.length || status === 'success') return;
    const wait = Math.max(0, lastEditAt + idleMs - Date.now());
    const t = window.setTimeout(() => {
      if (runningRef.current) return;
      const hint = revealHint();
      if (hint) setResult({ kind: 'hint', key: Date.now(), compile: false, hint });
      setLastEditAt(Date.now());
    }, wait);
    return () => clearTimeout(t);
  }, [phase, idleMs, hintsUsed, hints.length, status, lastEditAt, revealHint]);

  const run = useCallback(async () => {
    if (runningRef.current || phase !== 'mission') return;
    runningRef.current = true;
    sfx.click();
    setStatus('running');
    setOutput(null);
    setResult(null);
    try {
      const r = await runCode(lang, code, challenge);
      setOutput(r);
      if (r.success) {
        const base = diff.xp;
        const step = Math.round(base / 4);
        const codeXp = Math.max(step, base - hintsUsed * step);
        const xp = codeXp + quizXp;
        setLastXp(xp);
        updateRun((h) => ({ ...h, completed: { ...h.completed, [challenge.id]: { xp: Math.max(xp, h.completed[challenge.id]?.xp ?? 0) } } }));
        setStatus('success');
        setResult({ kind: 'success', key: Date.now(), compile: false });
        sfx.success();
        return;
      }

      sfx.failure();
      const fails = failCount + 1;
      setFailCount(fails);
      // Dica por erro: a partir da 1ª tentativa errada (iniciante) ou da 2ª (intermediário).
      const hint = diff.hints && fails >= diff.hints.failAt ? revealHint() : undefined;

      if (r.fatal) {
        // Erro de compilação/sintaxe/timeout: não custa integridade.
        setStatus('error');
        setResult({ kind: 'fail', key: Date.now(), compile: true, hint });
      } else {
        const left = lives - 1;
        setLives(left);
        if (left <= 0) captureNow();
        else {
          setStatus('error');
          setResult({ kind: 'fail', key: Date.now(), compile: false, hint });
        }
      }
    } finally {
      runningRef.current = false;
      setLastEditAt(Date.now());
    }
  }, [phase, lang, code, challenge, diff, hintsUsed, quizXp, failCount, lives, updateRun, revealHint, captureNow]);

  const dismissResult = useCallback(() => setResult(null), []);

  const next = useCallback(() => {
    sfx.whoosh();
    if (index < levels.length - 1) beginLevel(index + 1);
    else {
      setResult(null);
      setPhase('outro');
    }
  }, [index, levels.length, beginLevel]);

  const resetHero = useCallback(() => updateRun(() => ({ completed: {}, drafts: {} })), [updateRun]);

  /** Novo jogo: apaga todo o progresso salvo (todas as dificuldades e heróis) e volta para a escolha de dificuldade. */
  const resetAll = useCallback(() => {
    clearProgress();
    setProgress((p) => ({ ...emptyProgress(), muted: p.muted }));
    setHeroId('neo');
    setIndex(0);
    setCode('');
    resetLevelState();
    setQuizXp(0);
    setQuizDone(false);
    setLastXp(0);
    setMenuOpen(false);
    setPhase('difficulty');
  }, [resetLevelState]);

  const hasSave = useMemo(() => hasSavedGame(progress), [progress]);

  return {
    progress, phase, difficulty, diff, hero, lang, levels, index, challenge, questions, hints, code, lives, hintsUsed, failCount,
    quizXp, quizDone, status, output, lastXp, result, menuOpen, server, lastEditAt,
    completedCount, completedOf, totalXp, maxXp, nextIndex, heroProgress, hasSave,
    setPhase, setMenuOpen, toggleMute, chooseDifficulty, pickHero, finishStory, finishChapter, enterMission, answerQuestion,
    captureNow, retryLevel, beginLevel, startLevel: beginLevel, goSelect, goDifficulty, goHome, changeCode, resetCode, run,
    dismissResult, next, resetHero, resetAll,
  };
}

export type Game = ReturnType<typeof useGame>;
