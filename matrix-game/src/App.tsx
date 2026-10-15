import { LevelSelect } from './components/LevelSelect';
import { SoundToggle } from './components/SoundToggle';
import { useGame } from './hooks/useGame';
import { Captured } from './screens/Captured';
import { Chapter } from './screens/Chapter';
import { CharacterSelect } from './screens/CharacterSelect';
import { DifficultySelect } from './screens/DifficultySelect';
import { Mission } from './screens/Mission';
import { Outro } from './screens/Outro';
import { Quiz } from './screens/Quiz';
import { Splash } from './screens/Splash';
import { Story } from './screens/Story';

export default function App() {
  const game = useGame();

  return (
    <div className="app">
      {game.phase === 'splash' && <Splash game={game} />}
      {game.phase === 'difficulty' && <DifficultySelect game={game} />}
      {game.phase === 'select' && <CharacterSelect game={game} />}
      {game.phase === 'story' && <Story key={game.hero.id} game={game} />}
      {game.phase === 'chapter' && <Chapter key={`${game.difficulty}-${game.index}`} game={game} />}
      {game.phase === 'quiz' && <Quiz key={`${game.difficulty}-${game.index}`} game={game} />}
      {game.phase === 'mission' && <Mission game={game} />}
      {game.phase === 'captured' && <Captured game={game} />}
      {game.phase === 'outro' && <Outro game={game} />}
      {game.menuOpen && <LevelSelect game={game} />}
      {game.phase !== 'mission' && <SoundToggle game={game} />}
    </div>
  );
}
