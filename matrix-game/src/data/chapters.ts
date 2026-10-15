import type { Line } from '../components/Dialogue';
import type { Hero } from './heroes';

export type Chapter = { title: string; lines: (hero: Hero) => Line[] };

const op = (text: string): Line => ({ speaker: 'OPERADOR', tone: 'operator', text });
const nar = (text: string): Line => ({ speaker: 'NARRADOR', tone: 'narrator', text });
const me = (hero: Hero, text: string): Line => ({ speaker: hero.name, tone: 'hero', portrait: hero.portrait, color: hero.color, text });
const smith = (text: string): Line => ({ speaker: 'AGENTE SMITH', tone: 'smith', portrait: '/assets/smith.webp', text });

/** A história contínua: um capítulo antes de cada uma das 10 fases. */
export const CHAPTERS: Chapter[] = [
  {
    title: 'O DESPERTAR',
    lines: (h) => [
      op(`${h.name}, você está dentro. Esta avenida é a porta de entrada da simulação — e cada porta aqui é protegida por código.`),
      me(h, 'Então é assim que a Matrix se defende... com lógica.'),
      op('Exatamente. Passe pelo primeiro bloqueio e eu consigo rastrear você pela rede.'),
    ],
  },
  {
    title: 'ABRIGO',
    lines: (h) => [
      nar('Sirenes ao longe. Agentes varrem a avenida. O único abrigo é um velho hotel que ninguém lembra de ter construído.'),
      op('A fechadura do quarto 1101 é um programa. Quebre-a e você ganha alguns minutos.'),
      me(h, 'Minutos são tudo de que eu preciso.'),
    ],
  },
  {
    title: 'O SINAL',
    lines: (h) => [
      nar('Do alto do hotel, um painel gigante repete a mesma frase para a cidade inteira: a realidade é uma prisão.'),
      op('Aquele painel transmite o sinal que mantém as pessoas dormindo. Se você invadir o fluxo, abrimos uma brecha.'),
      me(h, 'Vamos mostrar a eles uma mensagem diferente.'),
    ],
  },
  {
    title: 'PERSEGUIÇÃO',
    lines: (h) => [
      nar('A brecha chamou atenção. Faróis em alta velocidade sobem o viaduto: os Agentes estão vindo.'),
      op('Consigo reprogramar o sistema de tráfego, mas preciso do seu código. Rápido!'),
      me(h, 'Segura firme. Isso vai ser apertado.'),
    ],
  },
  {
    title: 'A TORRE',
    lines: (h) => [
      nar('Relâmpagos iluminam a torre mais alta da cidade. Lá em cima fica o roteador central da simulação.'),
      me(h, 'Se eu chegar ao topo, vejo a cidade inteira como ela realmente é: dados.'),
      op('Cada andar tem uma trava. Comece a subir — e cuidado com o que o Oráculo vai perguntar.'),
    ],
  },
  {
    title: 'A ILUSÃO REAGE',
    lines: (h) => [
      nar('De repente as cores voltam. Luzes quentes, gente comum, música de rua... a ilusão está tentando puxar você de volta.'),
      me(h, 'Não. Eu sei o que é real agora.'),
      op('Ela se reconstrói com padrões. Quebre o padrão e o verde volta.'),
    ],
  },
  {
    title: 'EMBOSCADA',
    lines: (h) => [
      nar('Na calçada oeste, cada pedestre vira o mesmo rosto por um instante. O Agente Smith está perto.'),
      smith(`Você não pode fugir para sempre, ${h.name}. Eu estou em todo lugar.`),
      op('Ignora ele. Foca no código: é a sua única saída.'),
    ],
  },
  {
    title: 'A PORTA DOS FUNDOS',
    lines: (h) => [
      nar('Nas janelas de um prédio, números escorrem como chuva. Não é decoração: é a memória da Matrix exposta.'),
      op('Encontrei uma porta dos fundos no sistema. Ela só abre para quem pensa como a máquina.'),
      me(h, 'Então eu vou pensar como ela.'),
    ],
  },
  {
    title: 'DÉJÀ VU',
    lines: (h) => [
      nar('O asfalto molhado reflete a mesma cena duas vezes. Um déjà vu — sinal de que alguém alterou o código.'),
      op('Estão reescrevendo a cidade para prender você. Resolva antes que o reflexo se torne real.'),
      me(h, 'Falta só um passo até a Fonte.'),
    ],
  },
  {
    title: 'A FONTE',
    lines: (h) => [
      nar('Tudo fica branco. Não há mais cidade: só silêncio e código em estado puro.'),
      { speaker: 'O ARQUITETO', tone: 'narrator', color: '#ffffff', text: `Você é uma anomalia previsível, ${h.name}. Prove que é algo mais.` },
      me(h, 'Observe.'),
    ],
  },
];
