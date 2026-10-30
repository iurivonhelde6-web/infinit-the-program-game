import type { Shape } from '../lib/mini3d';

/**
 * Uma cena é um enquadramento da cidade (verde = INFINIT, noite = ilusão) com câmera,
 * gradação de cor e efeitos. As duas imagens têm o mesmo enquadramento, por isso dá
 * para transformar uma na outra com uma transição.
 */
export type SceneDef = {
  bg: 'green' | 'night';
  /** Ponto focal da câmera em % da imagem. */
  fx: number;
  fy: number;
  zoom: number;
  filter?: string;
  /** Intensidade da chuva (0 = sem chuva). */
  rain?: number;
  /** Opacidade da chuva de código sobre a cena. */
  code?: number;
  fog?: boolean;
  lightning?: boolean;
  /** Pisca a ilusão com faixas de código (cenas noturnas dentro do INFINIT). */
  unstable?: boolean;
};

export type LevelScene = SceneDef & {
  name: string;
  /** Holograma 3D da missão. */
  mesh: Shape;
  meshColor: string;
  /** Posição do herói na cena (% da largura) e se ele olha para o outro lado. */
  heroX: number;
  flip?: boolean;
};

export const LEVEL_SCENES: LevelScene[] = [
  { name: 'AVENIDA PRINCIPAL', bg: 'green', fx: 50, fy: 60, zoom: 1.12, rain: 1, code: 0.25, fog: true, mesh: 'cube', meshColor: '#00ff41', heroX: 24 },
  { name: 'HOTEL ABANDONADO', bg: 'green', fx: 10, fy: 46, zoom: 2.1, rain: 1.6, code: 0.15, mesh: 'octa', meshColor: '#7dffa0', heroX: 70, flip: true },
  { name: 'PAINEL DA PRISÃO', bg: 'green', fx: 90, fy: 22, zoom: 2.0, rain: 0.6, code: 0.5, mesh: 'ico', meshColor: '#00ff41', heroX: 30 },
  { name: 'VIADUTO SUL', bg: 'green', fx: 42, fy: 72, zoom: 2.5, filter: 'hue-rotate(28deg) saturate(1.2)', rain: 1.2, fog: true, mesh: 'torus', meshColor: '#3dffd0', heroX: 72, flip: true },
  { name: 'TORRE CENTRAL', bg: 'green', fx: 45, fy: 18, zoom: 2.0, rain: 1.4, lightning: true, code: 0.2, mesh: 'pyramid', meshColor: '#a6ff00', heroX: 22 },
  { name: 'CRUZAMENTO DA ILUSÃO', bg: 'night', fx: 74, fy: 70, zoom: 2.0, rain: 1, code: 0.3, unstable: true, mesh: 'sphere', meshColor: '#00ff41', heroX: 28 },
  { name: 'CALÇADA OESTE', bg: 'green', fx: 12, fy: 80, zoom: 2.1, filter: 'brightness(1.1) contrast(1.1)', rain: 1.8, fog: true, mesh: 'cylinder', meshColor: '#00ff41', heroX: 70, flip: true },
  { name: 'FACHADA DE DADOS', bg: 'green', fx: 60, fy: 32, zoom: 2.6, filter: 'hue-rotate(-18deg) brightness(1.08)', rain: 0.4, code: 0.55, mesh: 'knot', meshColor: '#c8ff3d', heroX: 24 },
  { name: 'ASFALTO ESPELHADO', bg: 'night', fx: 44, fy: 90, zoom: 2.2, filter: 'saturate(0.55) hue-rotate(-25deg) brightness(0.95)', rain: 1.6, code: 0.35, unstable: true, mesh: 'diamond', meshColor: '#5affff', heroX: 72, flip: true },
  { name: 'A FONTE', bg: 'green', fx: 50, fy: 48, zoom: 1.04, filter: 'grayscale(0.85) brightness(1.45) contrast(0.95)', rain: 0.6, code: 0.6, lightning: true, fog: true, mesh: 'ico', meshColor: '#ffffff', heroX: 50 },
];

export const SCENE_SELECT: SceneDef = { bg: 'green', fx: 50, fy: 62, zoom: 1.04, rain: 1, code: 0.2, fog: true };
export const SCENE_STREET_NIGHT: SceneDef = { bg: 'night', fx: 22, fy: 72, zoom: 1.7, rain: 1.2 };
export const SCENE_STREET_GLITCH: SceneDef = { bg: 'night', fx: 30, fy: 66, zoom: 1.45, rain: 1.2, code: 0.35, unstable: true };
export const SCENE_STREET_GREEN: SceneDef = { bg: 'green', fx: 40, fy: 64, zoom: 1.25, rain: 1.2, code: 0.35, fog: true };
export const SCENE_OPERATOR: SceneDef = { bg: 'green', fx: 84, fy: 30, zoom: 2.4, code: 0.6, rain: 0.4 };
export const SCENE_BLUE: SceneDef = { bg: 'night', fx: 50, fy: 55, zoom: 1.05, rain: 0.8, fog: true };
export const SCENE_SMITH: SceneDef = { bg: 'green', fx: 50, fy: 40, zoom: 1.3, filter: 'hue-rotate(-95deg) saturate(1.6) brightness(0.7)', rain: 1.6, code: 0.4, lightning: true };
export const SCENE_FINAL: SceneDef = { bg: 'green', fx: 50, fy: 50, zoom: 1.0, filter: 'brightness(1.25)', code: 0.5, rain: 0.4, fog: true };
