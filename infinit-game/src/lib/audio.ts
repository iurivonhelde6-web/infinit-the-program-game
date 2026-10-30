/**
 * Efeitos sonoros sintetizados com Web Audio + trilha sonora em MP3 que toca sem parar o jogo todo.
 * O navegador só libera som após um gesto do usuário, por isso a abertura pede um clique quando
 * o autoplay é bloqueado.
 */

type AC = typeof AudioContext;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let musicOn = false;

function ensure(): AudioContext | null {
  if (!ctx) {
    const Ctor: AC | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, delay = 0, slideTo?: number) {
  const c = ensure();
  if (!c || !master || muted) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  click: () => tone(520, 0.07, 'square', 0.06, 0, 880),
  tick: () => tone(1700 + Math.random() * 300, 0.02, 'square', 0.015),
  success: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'square', 0.07, i * 0.09)),
  failure: () => {
    tone(220, 0.35, 'sawtooth', 0.08, 0, 70);
    tone(110, 0.4, 'square', 0.05, 0.05, 40);
  },
  hint: () => [660, 880].forEach((f, i) => tone(f, 0.1, 'triangle', 0.07, i * 0.07)),
  glitch: () => noise(0.22, 0.06, 2400),
  whoosh: () => {
    noise(0.5, 0.05, 900);
    tone(180, 0.45, 'sawtooth', 0.03, 0, 60);
  },
  pill: () => {
    tone(330, 0.5, 'sine', 0.08, 0, 990);
    noise(0.35, 0.03, 4000);
  },
  type: () => tone(1200 + Math.random() * 500, 0.018, 'square', 0.012),
};

let noiseBuf: AudioBuffer | null = null;
function noise(dur: number, vol: number, cutoff: number) {
  const c = ensure();
  if (!c || !master || muted) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = cutoff;
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur);
}

// ─── Trilha sonora: um único <audio> no nível do módulo, então ela continua tocando
// sem interrupção quando o jogo troca de tela. ───
const TRACK_URL = '/assets/soundtrack.mp3';
const TRACK_VOLUME = 0.6;
let track: HTMLAudioElement | null = null;

function getTrack() {
  if (!track) {
    track = new Audio(TRACK_URL);
    track.loop = true;
    track.preload = 'auto';
    track.volume = TRACK_VOLUME;
  }
  return track;
}

export const music = {
  /** Toca a trilha. Retorna false se o navegador bloqueou (precisa de um clique antes). */
  async start(): Promise<boolean> {
    musicOn = true;
    if (muted) return true;
    const t = getTrack();
    if (!t.paused) return true;
    try {
      await t.play();
      return true;
    } catch {
      return false;
    }
  },
  stop() {
    musicOn = false;
    track?.pause();
  },
  get playing() {
    return !!track && !track.paused;
  },
};

/** Baixa a trilha antes de tocar, para ela começar junto com a chuva de código. */
export function preloadMusic() {
  getTrack().load();
}

export function setMuted(value: boolean) {
  muted = value;
  if (master) master.gain.value = value ? 0 : 1;
  if (!track) return;
  if (value) track.pause();
  else if (musicOn) void track.play().catch(() => {});
}

// Pausa tudo quando a página some (aba em segundo plano, janela fechada/minimizada) e retoma ao voltar.
function onHide() {
  track?.pause();
  if (ctx?.state === 'running') void ctx.suspend();
}
function onShow() {
  if (document.hidden) return;
  if (ctx?.state === 'suspended') void ctx.resume();
  if (track && musicOn && !muted) void track.play().catch(() => {});
}
document.addEventListener('visibilitychange', () => (document.hidden ? onHide() : onShow()));
window.addEventListener('pagehide', onHide);
window.addEventListener('pageshow', onShow);

// Em dev, o HMR recarrega este módulo: para a trilha antiga para não ficar tocando órfã.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    musicOn = false;
    onHide();
    track = null;
    void ctx?.close();
  });
}

/** Chame em um gesto do usuário (clique/tecla) para liberar o áudio. */
export function unlock() {
  ensure();
}
