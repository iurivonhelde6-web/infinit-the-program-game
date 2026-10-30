import { useEffect, useRef } from 'react';

const CHARS = '01ｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ<>{}[]=+*';
const FPS = 30;
const pick = () => CHARS[Math.floor(Math.random() * CHARS.length)];

type Props = {
  /** 'background' pinta sobre preto; 'overlay' deixa rastros transparentes (para cair sobre imagens). */
  mode?: 'background' | 'overlay';
  fontSize?: number;
  /** 0–1: fração das colunas ativas. */
  density?: number;
  speed?: number;
  className?: string;
};

/** Chuva de código em canvas. Respeita DPR, pausa com a aba oculta e fica estática com "reduzir movimento". */
export function CodeRain({ mode = 'background', fontSize = 18, density = 1, speed = 1, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const overlay = mode === 'overlay';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let pos: number[] = [];
    let vel: number[] = [];
    let on: boolean[] = [];

    const resize = () => {
      const dpr = 1; // glifos de 13–18px não precisam de retina: 4x menos pixels por quadro
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!overlay) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
      }
      const cols = Math.ceil(w / fontSize);
      while (pos.length < cols) {
        pos.push(-Math.random() * 50);
        vel.push((0.25 + Math.random() * 0.6) * speed);
        on.push(Math.random() < density);
      }
      pos.length = vel.length = on.length = cols;
    };

    const step = () => {
      if (overlay) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.11)';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
      for (let i = 0; i < pos.length; i++) {
        if (!on[i]) continue;
        const prev = Math.floor(pos[i]);
        pos[i] += vel[i];
        const row = Math.floor(pos[i]);
        if (row === prev || row < 0) continue;
        const x = i * fontSize;
        ctx.fillStyle = '#00ff41';
        ctx.fillText(pick(), x, (row - 1) * fontSize);
        ctx.fillStyle = '#e4ffe9';
        ctx.fillText(pick(), x, row * fontSize);
        if (row * fontSize > h && Math.random() > 0.96) {
          pos[i] = -Math.random() * 25;
          vel[i] = (0.25 + Math.random() * 0.6) * speed;
          on[i] = Math.random() < density;
        }
      }
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    if (reduce) {
      for (let n = 0; n < 80; n++) step();
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const fps = document.documentElement.classList.contains('low-fx') ? 15 : FPS;
      if (document.hidden || t - last < 1000 / fps) return;
      last = t;
      step();
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mode, fontSize, density, speed]);

  return <canvas ref={ref} className={className ?? 'rain-canvas'} aria-hidden="true" />;
}
