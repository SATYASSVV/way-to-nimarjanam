import React from 'react';
import { Play, ArrowLeft, Target, Shield, Compass, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const LevelIntroModal: React.FC = () => {
  const { currentLevel, startLevel, setScreen } = useGameStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/40 text-white shadow-2xl animate-fadeIn">
        {/* Top Tag */}
        <div className="flex items-center justify-between mb-4">
          <div className="px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            LEVEL {currentLevel.id} BRIEFING
          </div>
          <button
            onClick={() => setScreen('level_select')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black font-devotional text-amber-300 mb-1">
          {currentLevel.name}
        </h2>
        <p className="text-sm font-semibold text-amber-400/80 mb-4">
          {currentLevel.teluguName}
        </p>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          {currentLevel.description}
        </p>

        {/* Objectives Box */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 mb-6">
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-400" />
            Sacred Objectives
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block mb-0.5">Route Distance</span>
              <span className="font-bold text-white text-sm">{currentLevel.targetDistance}m</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block mb-0.5">Clean Waste Required</span>
              <span className="font-bold text-cyan-300 text-sm">
                {currentLevel.requiredTrash > 0 ? `${currentLevel.requiredTrash} items` : 'Ocean Reach'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block mb-0.5">Checkpoint</span>
              <span className="font-bold text-emerald-400 text-sm">{currentLevel.checkpointDistance}m</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block mb-0.5">Punya Bonus</span>
              <span className="font-bold text-amber-400 text-sm">+{currentLevel.punyaBonus} Punya</span>
            </div>
          </div>
        </div>

        {/* Guide / Controls Tip */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 mb-6">
          <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Controls Tip:</span> {currentLevel.narrativeTip}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => startLevel(currentLevel.id, false)}
          className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Embark Journey</span>
        </button>
      </div>
    </div>
  );
};
