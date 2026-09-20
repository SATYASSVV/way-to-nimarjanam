import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { LandingPage } from './components/landing/LandingPage';
import { SettingsModal } from './components/landing/SettingsModal';
import { LevelSelectScreen } from './components/level-select/LevelSelectScreen';
import { LevelIntroModal } from './components/ui/LevelIntroModal';
import { GameCanvas } from './components/game/GameCanvas';
import { HUD } from './components/ui/HUD';
import { PauseMenu } from './components/ui/PauseMenu';
import { GameOverScreen } from './components/ui/GameOverScreen';
import { LevelCompleteScreen } from './components/ui/LevelCompleteScreen';
import { NimarjanamEnding } from './components/ui/NimarjanamEnding';
import { ScorePopup } from './components/ui/ScorePopup';

export const App: React.FC = () => {
  const { screen, isPaused } = useGameStore();

  // Prevent default arrow key scrolling on window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-sacred-dark text-white select-none">
      {/* 1. Landing Screen */}
      {screen === 'landing' && <LandingPage />}

      {/* 2. Level Select Screen */}
      {screen === 'level_select' && <LevelSelectScreen />}

      {/* 3. Level Intro Modal */}
      {screen === 'intro' && (
        <>
          <LevelSelectScreen />
          <LevelIntroModal />
        </>
      )}

      {/* 4. Active 3D Gameplay Screen */}
      {screen === 'playing' && (
        <div className="relative w-full h-full">
          <GameCanvas />
          <HUD />
          <ScorePopup />
          {isPaused && <PauseMenu />}
        </div>
      )}

      {/* 5. Game Over Screen */}
      {screen === 'game_over' && (
        <div className="relative w-full h-full">
          <GameCanvas />
          <GameOverScreen />
        </div>
      )}

      {/* 6. Level Complete Screen */}
      {screen === 'level_complete' && (
        <div className="relative w-full h-full">
          <GameCanvas />
          <LevelCompleteScreen />
        </div>
      )}

      {/* 7. Respectful Final Ocean Nimarjanam Ceremony */}
      {screen === 'nimarjanam_ending' && <NimarjanamEnding />}

      {/* Global Settings Modal (can be opened from any screen) */}
      <SettingsModal />
    </div>
  );
};

export default App;
