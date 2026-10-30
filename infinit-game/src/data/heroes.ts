import type { Lang } from '../../shared/challenges';
import type { Shape } from '../lib/mini3d';

export type HeroId = 'weller' | 'rick' | 'vh';

export type Hero = {
  id: HeroId;
  name: string;
  /** Rótulo abaixo do nome no card (o papel no grupo). */
  role: string;
  lang: Lang;
  langLabel: string;
  /** Nome da linguagem para a linha secundária do card. */
  langName: string;
  /** Cor de destaque da linguagem. */
  color: string;
  tagline: string;
  traits: string;
  sprite: string;
  portrait: string;
  /** Emblema 3D da linguagem na tela de seleção. */
  emblem: Shape;
  /** História do personagem (cena ao confirmar a seleção e perfil). */
  bio: string[];
  /** Frase-lema. */
  motto: string;
  /** Falas da cena de abertura (antes e depois da cidade virar código). */
  storyA: string;
  storyB: string;
  /** Falas curtas depois de um acerto. */
  wins: string[];
  /** O pedaço da condição de parada que ele encontra no fim (epílogo). */
  fragment: string;
};

export const HEROES: Hero[] = [
  {
    id: 'weller',
    name: 'WELLER',
    role: 'SÊNIOR DEV',
    lang: 'java',
    langLabel: 'JAVA',
    langName: 'Java',
    color: '#ff9f43',
    tagline: 'Disciplina, tipos fortes e orientação a objetos.',
    traits: 'Compilado · Tipagem estática',
    sprite: '/assets/weller-sprite.webp',
    portrait: '/assets/weller-portrait.webp',
    emblem: 'cube',
    bio: [
      'Passou 20 anos escrevendo os sistemas que mantinham o mundo antigo em pé.',
      'Sabia que havia partes do código que ninguém deveria tocar. E tocou mesmo assim.',
      'Foi uma linha dele, esquecida num módulo legado, que ativou o INFINIT.',
      'Não luta por heroísmo: luta por culpa. Quer encontrar o commit que causou tudo e reverter.',
    ],
    motto: 'Eu escrevi esse bug. Eu vou corrigir.',
    storyA: 'Vinte anos de commits. Um deles abriu esta prisão. Hoje, quem vai atravessá-la sou eu.',
    storyB: 'Java é a minha escolha: classes, tipos, contratos claros. No INFINIT, quem domina a estrutura consegue dobrá-la.',
    wins: ['Compilou de primeira. A estrutura não mente.', 'Cada tipo no seu lugar. É assim que se constrói uma saída.', 'A máquina começa a obedecer às nossas regras.'],
    fragment: 'o commit esquecido que ligou o loop',
  },
  {
    id: 'rick',
    name: 'RICK',
    role: 'ARCHITECT',
    lang: 'python',
    langLabel: 'PYTHON',
    langName: 'Python',
    color: '#5ab0ff',
    tagline: 'Clareza, poucas linhas e muita intuição.',
    traits: 'Interpretado · Tipagem dinâmica',
    sprite: '/assets/rick-sprite.webp?v=2',
    portrait: '/assets/rick-portrait.webp?v=2',
    emblem: 'torus',
    bio: [
      'O mais calmo do grupo. Desenhou arquiteturas que sustentaram milhões de pessoas.',
      'Agora enxerga a do INFINIT como uma obra perfeita demais: sem falhas, sem saída.',
      'Acredita que todo sistema tem uma condição de parada escondida e caça o ponto cego do projeto.',
      'Seu motivo é provar que nenhuma prisão é perfeita.',
    ],
    motto: 'Todo sistema tem uma porta. Só falta o diagrama certo.',
    storyA: 'Sempre senti que havia algo errado com este projeto. Um ruído de fundo que nunca desliga.',
    storyB: 'Python. Simples, legível, direto ao ponto. Se vou encontrar o ponto cego do INFINIT, quero enxergar cada linha.',
    wins: ['Eu consigo ver o código agora.', 'Menos linhas, mais verdade.', 'Os padrões estão ficando claros.'],
    fragment: 'o ponto cego que a arquitetura escondia',
  },
  {
    id: 'vh',
    name: 'VH',
    role: 'FULLSTACK',
    lang: 'javascript',
    langLabel: 'JAVASCRIPT',
    langName: 'JavaScript',
    color: '#ffd23f',
    tagline: 'Velocidade, flexibilidade e a linguagem da web.',
    traits: 'Roda no navegador · Tipagem dinâmica',
    sprite: '/assets/vh.png',
    portrait: '/assets/vh-portrait.png',
    emblem: 'octa',
    bio: [
      'O mais jovem, e o único que transita entre o que o usuário vê e o que roda por trás.',
      'Foi quem percebeu que a "saída" da velha simulação era uma tela de login falsa.',
      'Seu irmão ficou preso numa thread do INFINIT enquanto ele ajudava os outros a escapar. Ele jurou voltar.',
      'Luta por pessoas, não por código.',
    ],
    motto: 'Se existe uma tela, existe um jeito de passar por ela.',
    storyA: 'Eles acham que controlam cada esquina desta cidade. Mal sabem que eu já estou dentro do sistema deles.',
    storyB: 'JavaScript roda em todo lugar — inclusive aqui. Rápido, flexível, imprevisível. Do jeito que eu gosto.',
    wins: ['Rápido e limpo. Nenhum Agente percebeu.', 'Executou no primeiro ciclo. Próximo alvo.', 'O sistema nem viu de onde veio.'],
    fragment: 'a tela que ninguém tinha atravessado',
  },
];

export const heroById = (id: HeroId) => HEROES.find((h) => h.id === id)!;
export const heroByLang = (lang: Lang) => HEROES.find((h) => h.lang === lang)!;

export const SMITH = { name: 'AGENTE SMITH', image: '/assets/smith.webp' };

/** Saudação do Smith por personagem (edite aqui). Sem entrada, a fala original vai sozinha. */
export const smithGreetings: Partial<Record<HeroId, string>> = {
  weller: 'Olá, Sr. Weller.',
  rick: 'Olá, Sr. Rick.',
  vh: 'Olá, Sr. VH.',
};

/**
 * Provocações do Smith por personagem, usadas só em momentos-chave (início do desafio, erro, vitória/captura).
 * Sem o nome no fim: elas sempre vêm logo depois da saudação, que já o diz.
 */
export const smithTaunts: Partial<Record<HeroId, string>> = {
  weller: 'Você ajudou a construir esta jaula.',
  rick: 'Seus diagramas nunca previram isto.',
  vh: 'Seu irmão ainda está compilando.',
};

/** Toda fala do Smith passa por aqui: saudação + (provocação) + frase original. */
export function smithSays(id: HeroId, text: string, taunt = false) {
  const greet = smithGreetings[id];
  const extra = taunt ? smithTaunts[id] : undefined;
  return [greet, extra, text].filter(Boolean).join(' ');
}

export const LINES = {
  success: (hero: string) => `Excelente trabalho, ${hero}. Você está começando a ver o código.`,
  failure: 'O seu erro me trouxe até aqui e eu sou inevitável.',
  captured: 'HA HA HA, adeus.',
};
