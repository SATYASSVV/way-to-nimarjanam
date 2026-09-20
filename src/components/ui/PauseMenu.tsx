import React from 'react';
import { Play, RotateCcw, Home, Settings, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from '../../services/audioManager';

export const PauseMenu: React.FC = () => {
  const {
    isPaused,
    resumeGame,
    restartLevel,
    returnHome,
    openSettings,
    progress,
    currentLevel,
  } = useGameStore();

  if (!isPaused) return null;

  const soundEnabled = progress.settings.soundEnabled;

  const handleToggleSound = () => {
    audioManager.setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm p-6 rounded-3xl glass-panel border border-amber-500/30 text-white text-center shadow-2xl space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-black font-devotional text-amber-300 tracking-wide">
            JOURNEY PAUSED
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Level {currentLevel.id}: {currentLevel.name}
          </p>
        </div>

        {/* Buttons List */}
        <div className="space-y-3">
          {/* Resume */}
          <button
            onClick={resumeGame}
            className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            Resume Journey
          </button>

          {/* Restart Level */}
          <button
            onClick={() => restartLevel(false)}
            className="w-full py-3 rounded-2xl font-semibold text-xs uppercase tracking-wider glass-card hover:bg-white/10 text-white/90 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart Level (from 0m)
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="w-full py-3 rounded-2xl font-semibold text-xs glass-card hover:bg-white/10 text-white/90 flex items-center justify-center gap-2 transition-colors"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sound: Enabled</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>Sound: Muted</span>
              </>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={openSettings}
            className="w-full py-3 rounded-2xl font-semibold text-xs glass-card hover:bg-white/10 text-white/90 flex items-center justify-center gap-2 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            Detailed Settings
          </button>

          {/* Return Home */}
          <button
            onClick={returnHome}
            className="w-full py-3 rounded-2xl font-semibold text-xs text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};
