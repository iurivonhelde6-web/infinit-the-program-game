import { useEffect, useRef } from 'react';

/** Chuva diagonal em pixel art, desenhada em canvas de baixa resolução e ampliada (visual 32 bits). */
export function RainFX({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || intensity <= 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const SCALE = 3; // 1 pixel do canvas = 3 pixels na tela
    let w = 0;
    let h = 0;
    type Drop = { x: number; y: number; v: number; l: number };
    let drops: Drop[] = [];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.ceil(r.width / SCALE));
      h = Math.max(1, Math.ceil(r.height / SCALE));
      canvas.width = w;
      canvas.height = h;
      const n = Math.round(((w * h) / 900) * intensity);
      drops = Array.from({ length: n }, () => ({ x: Math.random() * w * 1.3, y: Math.random() * h, v: 2 + Math.random() * 2.5, l: 3 + Math.random() * 5 }));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || t - last < 33) return;
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(190, 255, 205, 0.45)';
      for (const d of drops) {
        for (let k = 0; k < d.l; k++) ctx.fillRect(Math.round(d.x - k * 0.35), Math.round(d.y - k), 1, 1);
        d.y += d.v;
        d.x -= d.v * 0.35;
        if (d.y > h + 8) {
          d.y = -8;
          d.x = Math.random() * w * 1.3;
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [intensity]);

  return <canvas ref={ref} className="stage__rain" aria-hidden="true" />;
}
