import type { Difficulty, Lang } from '../../shared/challenges';

const KEY = 'matrix-programming-game:v2';

export type LevelRecord = { xp: number };
export type HeroProgress = { completed: Record<number, LevelRecord>; drafts: Record<number, string> };
export type Runs = Record<Difficulty, Record<Lang, HeroProgress>>;

export type Progress = {
  runs: Runs;
  muted: boolean;
  difficulty: Difficulty;
};

const emptyHero = (): HeroProgress => ({ completed: {}, drafts: {} });
const emptyRun = () => ({ java: emptyHero(), python: emptyHero(), javascript: emptyHero() });

export const emptyProgress = (): Progress => ({
  runs: { iniciante: emptyRun(), intermediario: emptyRun(), senior: emptyRun() },
  muted: false,
  difficulty: 'iniciante',
});

export function loadProgress(): Progress {
  const base = emptyProgress();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<Progress>;
    for (const d of Object.keys(base.runs) as Difficulty[]) {
      for (const l of Object.keys(base.runs[d]) as Lang[]) {
        const h = p.runs?.[d]?.[l];
        if (h) base.runs[d][l] = { completed: h.completed ?? {}, drafts: h.drafts ?? {} };
      }
    }
    base.muted = !!p.muted;
    if (p.difficulty && p.difficulty in base.runs) base.difficulty = p.difficulty;
    return base;
  } catch {
    return base;
  }
}

/** Apaga o jogo salvo (o mudo é preservado por quem chama, se quiser). */
export function clearProgress() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* sem acesso ao storage: nada a apagar */
  }
}

/** Há alguma fase concluída ou rascunho salvo em qualquer dificuldade/linguagem? */
export const hasSavedGame = (p: Progress) =>
  Object.values(p.runs).some((run) => Object.values(run).some((h) => Object.keys(h.completed).length > 0 || Object.keys(h.drafts).length > 0));

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* modo privado / sem espaço: o jogo continua sem salvar */
  }
}
