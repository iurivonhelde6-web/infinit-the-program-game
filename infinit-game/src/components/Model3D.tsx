import { useEffect, useRef, type CSSProperties } from 'react';
import { mount3D, type SceneOptions } from '../lib/mini3d';

type Mounted = ReturnType<typeof mount3D>;

type Props = Omit<SceneOptions, 'style'> & {
  /** Aparência: 'solid', 'holo' (wireframe) ou 'both'. */
  look?: SceneOptions['style'];
  className?: string;
  style?: CSSProperties;
  /** Segue o ponteiro do mouse com uma leve inclinação. */
  follow?: boolean;
};

export function Model3D({ shape, color, look, spin, tilt, roll, className, style, follow = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Mounted>(null);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const speed = reduce ? 0.08 : (spin ?? 0.6);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  // A velocidade muda sem recriar o contexto WebGL.
  useEffect(() => {
    sceneRef.current?.setSpin(speed);
  }, [speed]);

  // Um canvas novo (key) para cada combinação de forma/cor: um contexto WebGL perdido não pode ser reutilizado.
  const canvasKey = `${shape}-${color}-${look}-${tilt}-${roll}`;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const scene = mount3D(canvas, { shape, color, style: look, spin: speedRef.current, tilt, roll });
    sceneRef.current = scene;
    if (!scene) return;
    const onMove = (e: PointerEvent) => scene.point(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    if (follow) window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [shape, color, look, tilt, roll, follow, canvasKey]);

  // Sem CSS filter no canvas (caro a cada quadro); o brilho vem da mistura aditiva + um halo estático.
  return (
    <span className={`model3d ${className ?? ''}`} style={{ ...style, '--glow': color } as CSSProperties} aria-hidden="true">
      <canvas key={canvasKey} ref={ref} />
    </span>
  );
}
