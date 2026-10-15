import type { Game } from '../hooks/useGame';
import { MuteIcon, VolumeIcon } from './Icons';

/** Liga/desliga a trilha e os efeitos (fica no canto em todas as telas, exceto na missão, que tem o HUD). */
export function SoundToggle({ game }: { game: Game }) {
  const muted = game.progress.muted;
  return (
    <button className="sound" onClick={(e) => (e.stopPropagation(), game.toggleMute())} aria-label={muted ? 'Ligar som' : 'Desligar som'} aria-pressed={muted}>
      {muted ? <MuteIcon size={18} /> : <VolumeIcon size={18} />}
    </button>
  );
}
