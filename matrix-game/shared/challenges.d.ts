export type Lang = 'java' | 'python' | 'javascript';
export type Difficulty = 'iniciante' | 'intermediario' | 'senior';
export type JavaType = 'int' | 'int[]' | 'int[][]' | 'String' | 'String[]' | 'boolean';

export type TestCase = { input: unknown[]; expected: unknown };

export type Variant = {
  fn: string;
  params: string[] | [JavaType, string][];
  ret?: JavaType;
  note?: string;
  description?: string;
  tests?: TestCase[];
  hints?: string[];
};

export type Challenge = {
  id: number;
  title: string;
  description: string;
  tests: TestCase[];
  hints?: string[];
  variants: Record<Lang, Variant>;
};

export type DifficultyInfo = {
  id: Difficulty;
  label: string;
  xp: number;
  color: string;
  summary: string;
  rules: string;
  hints: { idleMs: number; failAt: number; kind: 'solution' | 'concept' } | null;
};

export const LANGS: readonly Lang[];
export const LEVELS_PER_DIFFICULTY: number;
export const DIFFICULTIES: Record<Difficulty, DifficultyInfo>;
export const DIFFICULTY_ORDER: readonly Difficulty[];
export const WORDS: Record<Lang, Record<string, string>>;
export const CHALLENGES: Record<Difficulty, Challenge[]>;
export const ALL_CHALLENGES: Challenge[];
export function starterCode(challenge: Challenge, lang: Lang): string;
export function testsFor(challenge: Challenge, lang: Lang): TestCase[];
export function hintsFor(challenge: Challenge, lang: Lang): string[];
export function missionText(challenge: Challenge, lang: Lang, hero: string): string;
export function deepEqual(a: unknown, b: unknown): boolean;
