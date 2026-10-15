import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { SceneDef } from '../data/scenes';
import { sfx } from '../lib/audio';
import { MatrixRain } from './MatrixRain';
import { RainFX } from './RainFX';

type Props = {
  scene: SceneDef;
  children?: ReactNode;
  className?: string;
  /** Mudar este valor dispara a transição de glitch. */
  glitchKey?: string | number;
  /** Rótulo do local, no canto superior. */
  caption?: string;
  /** Tom extra por cima de tudo (ex.: vermelho quando o Smith aparece). */
  mood?: 'none' | 'danger' | 'success';
};

const IMAGES = { green: '/assets/city-green.webp', night: '/assets/city-night.webp' };

/**
 * Palco de cena: a cidade com câmera (zoom em um ponto focal + leve deriva),
 * transição entre ilusão (noite) e Matrix (verde), chuva, neblina, relâmpagos,
 * chuva de código e scanlines. Personagens e diálogos entram como children.
 */
export function Stage({ scene, children, className, glitchKey, caption, mood = 'none' }: Props) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (glitchKey === undefined) return;
    setGlitching(true);
    sfx.glitch();
    const t = window.setTimeout(() => setGlitching(false), 650);
    return () => clearTimeout(t);
  }, [glitchKey]);

  const camStyle = {
    '--fx': `${scene.fx}%`,
    '--fy': `${scene.fy}%`,
    '--zoom': scene.zoom,
  } as CSSProperties;

  return (
    <div className={`stage ${glitching ? 'is-glitching' : ''} ${scene.unstable ? 'is-unstable' : ''} mood-${mood} ${className ?? ''}`}>
      <div className="stage__cam" style={camStyle}>
        <div className="stage__drift">
          {(['night', 'green'] as const).map((bg) => (
            <img
              key={bg}
              src={IMAGES[bg]}
              alt=""
              draggable={false}
              className={`stage__bg ${scene.bg === bg ? 'is-on' : ''}`}
              style={{ filter: scene.bg === bg ? scene.filter : undefined, objectPosition: `${scene.fx}% ${scene.fy}%` }}
            />
          ))}
        </div>
      </div>

      {scene.unstable && <div className="stage__bleed" aria-hidden="true" />}
      {scene.fog && <div className="stage__fog" aria-hidden="true" />}
      {!!scene.code && (
        <div className="stage__code" style={{ opacity: scene.code }}>
          <MatrixRain mode="overlay" fontSize={14} density={0.55} speed={0.9} />
        </div>
      )}

      <div className="stage__actors">{children}</div>

      {!!scene.rain && <RainFX intensity={scene.rain} />}
      {scene.lightning && <div className="stage__flash" aria-hidden="true" />}
      <div className="stage__grade" aria-hidden="true" />
      <div className="stage__scan" aria-hidden="true" />
      <div className="stage__glitch" aria-hidden="true" />
      {caption && <div className="stage__caption">{caption}</div>}
    </div>
  );
}

type ActorProps = {
  src: string;
  alt: string;
  /** Centro horizontal em % do palco. */
  x: number;
  /** Altura em % do palco. */
  height: number;
  flip?: boolean;
  enter?: 'fade' | 'left' | 'right' | 'glitch' | 'rise';
  glow?: string;
  className?: string;
  reflect?: boolean;
};

/** Personagem recortado em pé no chão da cena, com sombra, reflexo no asfalto molhado e respiração. */
export function Actor({ src, alt, x, height, flip, enter = 'fade', glow, className, reflect = true }: ActorProps) {
  return (
    <div className={`actor enter-${enter} ${className ?? ''}`} style={{ left: `${x}%`, height: `${height}%` } as CSSProperties}>
      <div className="actor__body" style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
        <img src={src} alt={alt} draggable={false} className="actor__img" style={glow ? { filter: `drop-shadow(0 0 6px ${glow}) drop-shadow(0 0 18px ${glow}66)` } : undefined} />
        {reflect && <img src={src} alt="" aria-hidden="true" draggable={false} className="actor__reflect" />}
      </div>
      <div className="actor__shadow" />
    </div>
  );
}
