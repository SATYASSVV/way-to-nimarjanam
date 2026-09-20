import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, ArrowRight, RotateCcw, Home, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const LevelCompleteScreen: React.FC = () => {
  const {
    currentLevel,
    score,
    trashCollected,
    ecoCollected,
    startLevel,
    returnHome,
    setScreen,
  } = useGameStore();

  useEffect(() => {
    // Launch joyful celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#f97316', '#ec4899', '#38bdf8', '#34d399'],
      });
    } catch (_) {}
  }, []);

  const nextLevelId = currentLevel.id + 1;
  const isLastLevel = currentLevel.id >= 5;

  const handleNextLevel = () => {
    if (!isLastLevel) {
      startLevel(nextLevelId, false);
    } else {
      setScreen('nimarjanam_ending');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/40 text-white text-center shadow-2xl space-y-6">
        {/* Celebration Header */}
        <div className="space-y-2">
          <div className="inline-flex p-3 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
            <CheckCircle2 className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-devotional text-amber-300 tracking-wide">
            LEVEL COMPLETED!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {currentLevel.name} successfully navigated with devotion.
          </p>
        </div>

        {/* Detailed Score & Stats Breakdown */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-white/10">
            <span>Route Travelled:</span>
            <span className="font-bold text-white">{currentLevel.targetDistance} meters</span>
          </div>

          <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-white/10">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Trash2 className="w-3.5 h-3.5" /> Plastic Trash Cleaned:
            </span>
            <span className="font-bold text-cyan-300">{trashCollected} items</span>
          </div>

          <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-white/10">
            <span className="flex items-center gap-1.5 text-pink-300">
              <Sparkles className="w-3.5 h-3.5" /> Sacred Eco-Gifts:
            </span>
            <span className="font-bold text-pink-300">{ecoCollected} items</span>
          </div>

          <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-white/10">
            <span>Level Completion Bonus:</span>
            <span className="font-bold text-amber-400">+{currentLevel.punyaBonus} Punya</span>
          </div>

          <div className="flex items-center justify-between text-base font-black pt-1 text-amber-300">
            <span>Total Punya Earned:</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {score} Punya
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Next Level or Final Nimarjanam */}
          <button
            onClick={handleNextLevel}
            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>{isLastLevel ? 'Proceed to Final Nimarjanam' : `Enter Level ${nextLevelId}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Replay Level */}
          <button
            onClick={() => startLevel(currentLevel.id, false)}
            className="w-full py-3 rounded-2xl font-semibold text-xs uppercase tracking-wider glass-card hover:bg-white/10 text-white/90 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay This Level</span>
          </button>

          {/* Home */}
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
