import React from 'react';
import { RotateCcw, Flag, Home, AlertCircle, Sparkles, Trash2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const GameOverScreen: React.FC = () => {
  const {
    currentLevel,
    distanceTravelled,
    score,
    trashCollected,
    restartLevel,
    returnHome,
    progress,
    checkpointPassed,
  } = useGameStore();

  const savedCp = progress.savedCheckpoint;
  const canResumeCheckpoint = (savedCp && savedCp.levelId === currentLevel.id) || checkpointPassed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-rose-500/40 text-white text-center shadow-2xl space-y-6">
        {/* Icon & Title */}
        <div className="space-y-2">
          <div className="inline-flex p-3 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black font-devotional text-rose-400 tracking-wide">
            BOAT OVERTURNED
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            The boat took too much damage from hazardous river obstacles.
          </p>
        </div>

        {/* Current Run Statistics */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Current Level:</span>
            <span className="font-bold text-white">Level {currentLevel.id}: {currentLevel.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Distance Travelled:</span>
            <span className="font-bold text-cyan-300">{Math.floor(distanceTravelled)}m / {currentLevel.targetDistance}m</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Punya Score:</span>
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> {score}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Trash Cleaned:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> {trashCollected}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Resume from Checkpoint if available */}
          {canResumeCheckpoint && (
            <button
              onClick={() => restartLevel(true)}
              className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Flag className="w-4 h-4" />
              <span>Resume from Checkpoint ({currentLevel.checkpointDistance}m)</span>
            </button>
          )}

          {/* Retry from beginning */}
          <button
            onClick={() => restartLevel(false)}
            className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Level from Beginning (0m)</span>
          </button>

          {/* Return Home */}
          <button
            onClick={returnHome}
            className="w-full py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Landing Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
