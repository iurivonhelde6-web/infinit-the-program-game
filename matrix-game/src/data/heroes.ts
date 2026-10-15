import type { Lang } from '../../shared/challenges';
import type { Shape } from '../lib/mini3d';

export type HeroId = 'morpheus' | 'neo' | 'trinity';

export type Hero = {
  id: HeroId;
  name: string;
  lang: Lang;
  langLabel: string;
  /** Cor de destaque da linguagem. */
  color: string;
  tagline: string;
  traits: string;
  sprite: string;
  portrait: string;
  /** Emblema 3D da linguagem na tela de seleção. */
  emblem: Shape;
  /** Falas da cena de abertura (antes e depois da cidade virar código). */
  storyA: string;
  storyB: string;
  /** Falas curtas depois de um acerto. */
  wins: string[];
};

export const HEROES: Hero[] = [
  {
    id: 'morpheus',
    name: 'MORPHEUS',
    lang: 'java',
    langLabel: 'JAVA',
    color: '#ff9f43',
    tagline: 'Disciplina, tipos fortes e orientação a objetos.',
    traits: 'Compilado · Tipagem estática',
    sprite: '/assets/morpheus-sprite.webp',
    portrait: '/assets/morpheus-portrait.webp',
    emblem: 'cube',
    storyA: 'Passei a vida procurando quem enxergasse além deste cenário. Hoje, quem vai atravessá-lo sou eu.',
    storyB: 'Java é a minha escolha: classes, tipos, contratos claros. Na Matrix, quem domina a estrutura consegue dobrá-la.',
    wins: ['Compilou de primeira. A estrutura não mente.', 'Cada tipo no seu lugar. É assim que se constrói uma saída.', 'A máquina começa a obedecer às nossas regras.'],
  },
  {
    id: 'neo',
    name: 'NEO',
    lang: 'python',
    langLabel: 'PYTHON',
    color: '#5ab0ff',
    tagline: 'Clareza, poucas linhas e muita intuição.',
    traits: 'Interpretado · Tipagem dinâmica',
    sprite: '/assets/neo-sprite.webp',
    portrait: '/assets/neo-portrait.webp',
    emblem: 'torus',
    storyA: 'Sempre senti que havia algo errado com este mundo. Um ruído de fundo que nunca desliga.',
    storyB: 'Python. Simples, legível, direto ao ponto. Se vou reescrever a realidade, quero enxergar cada linha.',
    wins: ['Eu consigo ver o código agora.', 'Menos linhas, mais verdade.', 'Os padrões estão ficando claros.'],
  },
  {
    id: 'trinity',
    name: 'TRINITY',
    lang: 'javascript',
    langLabel: 'JAVASCRIPT',
    color: '#ffd23f',
    tagline: 'Velocidade, flexibilidade e a linguagem da web.',
    traits: 'Roda no navegador · Tipagem dinâmica',
    sprite: '/assets/trinity-sprite.webp',
    portrait: '/assets/trinity-portrait.webp',
    emblem: 'octa',
    storyA: 'Eles acham que controlam cada esquina desta cidade. Mal sabem que eu já estou dentro do sistema deles.',
    storyB: 'JavaScript roda em todo lugar — inclusive aqui. Rápido, flexível, imprevisível. Do jeito que eu gosto.',
    wins: ['Rápido e limpo. Nenhum Agente percebeu.', 'Executou no primeiro ciclo. Próximo alvo.', 'O sistema nem viu de onde veio.'],
  },
];

export const heroById = (id: HeroId) => HEROES.find((h) => h.id === id)!;
export const heroByLang = (lang: Lang) => HEROES.find((h) => h.lang === lang)!;

export const SMITH = { name: 'AGENTE SMITH', image: '/assets/smith.webp' };

export const LINES = {
  success: (hero: string) => `Excelente trabalho, ${hero}. Você está começando a ver o código.`,
  failure: 'Olá Sr. Anderson, o seu erro me trouxe até aqui e eu sou inevitável.',
  captured: 'HA HA HA, adeus Sr. Anderson',
};
