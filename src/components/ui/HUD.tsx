import React, { useEffect } from 'react';
import {
  Heart,
  Pause,
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  Award,
  Flag,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from '../../services/audioManager';

export const HUD: React.FC = () => {
  const {
    currentLevel,
    distanceTravelled,
    score,
    trashCollected,
    ecoCollected,
    health,
    pauseGame,
    progress,
    checkpointToast,
    setBoatSteer,
    debugMode,
    debugTelemetry,
    toggleDebugMode,
  } = useGameStore();

  const soundEnabled = progress.settings.soundEnabled;

  const handleToggleSound = () => {
    audioManager.setSoundEnabled(!soundEnabled);
  };

  const progressPercent = Math.min(100, (distanceTravelled / currentLevel.targetDistance) * 100);
  const checkpointPercent = (currentLevel.checkpointDistance / currentLevel.targetDistance) * 100;
  const isTrashGoalMet = currentLevel.requiredTrash === 0 || trashCollected >= currentLevel.requiredTrash;

  useEffect(() => {
    if (!checkpointToast) return;

    const timeoutId = window.setTimeout(() => {
      useGameStore.setState({ checkpointToast: null });
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [checkpointToast]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        {/* Left: Level Info & Objectives */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full glass-card border-amber-500/30 text-amber-300 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Level {currentLevel.id}: {currentLevel.name}</span>
            </div>
            <span className="hidden sm:inline text-xs text-amber-400/80 font-medium">
              ({currentLevel.teluguName})
            </span>
          </div>

          {/* Cleaned Waste Badge */}
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`px-3 py-1 rounded-xl glass-card flex items-center gap-1.5 font-semibold ${
                isTrashGoalMet
                  ? 'border-emerald-500/40 text-emerald-300'
                  : 'border-cyan-500/30 text-cyan-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                Trash Cleaned: {trashCollected}
                {currentLevel.requiredTrash > 0 ? ` / ${currentLevel.requiredTrash}` : ''}
              </span>
              {isTrashGoalMet && currentLevel.requiredTrash > 0 && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>

            {/* Sacred Eco-gifts */}
            <div className="px-2.5 py-1 rounded-xl glass-card border-pink-500/30 text-pink-300 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>{ecoCollected} Eco Items</span>
            </div>
          </div>
        </div>

        {/* Right: Score, Health & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Punya Score Counter */}
          <div className="px-3.5 py-1.5 rounded-2xl glass-panel border-amber-500/40 flex items-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold">
                Punya Score
              </span>
              <span className="text-base sm:text-lg font-black text-amber-300 leading-none">
                {score}
              </span>
            </div>
          </div>

          {/* Health Hearts */}
          <div className="px-3 py-2 rounded-2xl glass-panel border-white/10 flex items-center gap-1">
            {[1, 2, 3].map((heartIndex) => {
              const isFull = heartIndex <= health;
              return (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                    isFull
                      ? 'fill-rose-500 text-rose-500 scale-100'
                      : 'fill-transparent text-slate-600 scale-90'
                  }`}
                />
              );
            })}
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={handleToggleSound}
            className="pointer-events-auto p-2.5 rounded-2xl glass-circle hover:bg-white/15 text-white transition-transform active:scale-95 shadow-lg"
            title="Toggle Sound"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
            )}
          </button>

          {/* Pause Button */}
          <button
            onClick={pauseGame}
            className="pointer-events-auto p-2.5 rounded-2xl glass-circle hover:bg-white/15 text-white transition-transform active:scale-95 shadow-lg"
            title="Pause Game"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Checkpoint Toast Banner */}
      {checkpointToast && (
        <div className="pointer-events-auto self-center mt-2 px-4 py-2 rounded-2xl bg-emerald-950/90 border border-emerald-400/50 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xl animate-bounce">
          <Flag className="w-4 h-4 text-emerald-400" />
          <span>
            <strong className="block uppercase">CHECKPOINT REACHED!</strong>
            <span className="font-normal">Your progress has been saved.</span>
          </span>
        </div>
      )}

      {debugMode && (
        <div className="pointer-events-auto absolute left-3 top-28 max-w-xs rounded-lg border border-lime-300/50 bg-black/80 p-3 font-mono text-[10px] text-lime-200 shadow-xl">
          <div className="mb-1 flex items-center justify-between gap-4 text-xs font-bold text-lime-300">
            <span>DEBUG TELEMETRY</span>
            <button onClick={toggleDebugMode} aria-label="Close debug telemetry">F3</button>
          </div>
          <div>distanceTravelled: {debugTelemetry.distanceTravelled.toFixed(2)}m</div>
          <div>forwardSpeed: {debugTelemetry.forwardSpeed.toFixed(2)} m/s</div>
          <div>deltaTime: {debugTelemetry.deltaTime.toFixed(4)}s</div>
          <div>boatX: {debugTelemetry.boatX.toFixed(2)}</div>
          <div>boat world: [{debugTelemetry.boatWorldPosition.map((value) => value.toFixed(2)).join(', ')}]</div>
          <div>nearest item: {debugTelemetry.nearestCollectibleWorldPosition
            ? `[${debugTelemetry.nearestCollectibleWorldPosition.map((value) => value.toFixed(2)).join(', ')}]`
            : 'none'}</div>
          <div>item distance: {debugTelemetry.nearestCollectibleDistance?.toFixed(2) ?? 'none'}m</div>
          <div>collision: {debugTelemetry.collisionDetected ? 'DETECTED' : 'clear'}</div>
          <div className="mt-1 text-amber-200">Press B to spawn a bottle at boat lane</div>
        </div>
      )}

      {/* Bottom Area: Progress Bar & Mobile Touch Controls */}
      <div className="flex flex-col gap-3">
        {/* Floating Virtual Touch Steering Buttons for Mobile Accessibility */}
        <div className="flex items-center justify-between px-2 sm:hidden pointer-events-auto">
          <button
            onPointerDown={() => setBoatSteer(-1)}
            onPointerUp={() => setBoatSteer(0)}
            onPointerCancel={() => setBoatSteer(0)}
            className="w-14 h-14 rounded-2xl glass-panel border-amber-500/30 flex items-center justify-center text-white active:bg-amber-500/30 active:scale-90 shadow-xl transition-transform"
            aria-label="Steer Left"
          >
            <ChevronLeft className="w-8 h-8 text-amber-300" />
          </button>

          <button
            onPointerDown={() => setBoatSteer(1)}
            onPointerUp={() => setBoatSteer(0)}
            onPointerCancel={() => setBoatSteer(0)}
            className="w-14 h-14 rounded-2xl glass-panel border-amber-500/30 flex items-center justify-center text-white active:bg-amber-500/30 active:scale-90 shadow-xl transition-transform"
            aria-label="Steer Right"
          >
            <ChevronRight className="w-8 h-8 text-amber-300" />
          </button>
        </div>

        {/* Distance Progress Bar */}
        <div className="w-full max-w-xl mx-auto p-3 rounded-2xl glass-panel border-white/10 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-white/80">
            <span className="flex items-center gap-1 text-cyan-300">
              <Flag className="w-3 h-3" />
              {Math.floor(distanceTravelled)}m travelled
            </span>
            <span className="text-amber-400">
              Goal: {currentLevel.targetDistance}m
            </span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-white/10">
            {/* Checkpoint Marker */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald-400 z-10"
              style={{ left: `${checkpointPercent}%` }}
              title={`Checkpoint at ${currentLevel.checkpointDistance}m`}
            />

            {/* Filled Progress Bar */}
            <div
              className="h-full rounded-full transition-all duration-150 bg-gradient-to-r from-cyan-500 via-amber-400 to-pink-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
