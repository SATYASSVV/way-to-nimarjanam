import React from 'react';
import { ArrowLeft, Lock, CheckCircle2, Star, Trash2, Award, Compass, Play } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { LEVELS } from '../../data/levelsConfig';

export const LevelSelectScreen: React.FC = () => {
  const { selectLevel, setScreen, progress, openSettings } = useGameStore();

  const isUnlocked = (levelId: number) => progress.unlockedLevels.includes(levelId);
  const isCompleted = (levelId: number) => progress.completedLevels.includes(levelId);

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'krishna_dawn': return 'from-amber-600/30 to-emerald-600/30 border-amber-500/40 text-amber-300';
      case 'village_ghat': return 'from-sky-600/30 to-teal-600/30 border-sky-500/40 text-sky-300';
      case 'cleanup_challenge': return 'from-cyan-600/30 to-indigo-600/30 border-cyan-500/40 text-cyan-300';
      case 'estuary_sea': return 'from-blue-600/30 to-purple-600/30 border-blue-500/40 text-blue-300';
      case 'ocean_nimarjanam': return 'from-rose-600/30 to-amber-600/30 border-rose-500/40 text-rose-300';
      default: return 'from-slate-600/30 to-slate-800/30 border-slate-500/40 text-slate-300';
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-sacred-dark text-white p-4 md:p-8 overflow-y-auto">
      {/* Background Ambience */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `url('/bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
        }}
      />
      <div className="fixed inset-0 bg-black/80 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10">
          <button
            onClick={() => setScreen('landing')}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl glass-card hover:bg-white/10 transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </button>

          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-extrabold font-devotional text-amber-300 tracking-wide">
              LEVEL SELECTION
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Choose an unlocked river passage to escort Lord Vinayaka
            </p>
          </div>

          <button
            onClick={openSettings}
            className="p-2.5 rounded-full glass-circle hover:text-amber-300 transition-colors"
            title="Settings"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {LEVELS.map((level) => {
            const unlocked = isUnlocked(level.id);
            const completed = isCompleted(level.id);
            const bestScore = progress.bestScores[level.id] || 0;
            const bestTrash = progress.bestTrash[level.id] || 0;

            return (
              <div
                key={level.id}
                className={`relative flex flex-col justify-between p-6 rounded-3xl transition-all duration-300 border ${
                  unlocked
                    ? 'glass-card border-amber-500/30 hover:border-amber-400 hover:scale-[1.02] shadow-xl hover:shadow-amber-500/10 cursor-pointer'
                    : 'bg-slate-900/50 border-white/5 opacity-60 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (unlocked) {
                    selectLevel(level.id);
                  }
                }}
              >
                {/* Card Top / Header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/10 text-amber-300">
                      LEVEL {level.id}
                    </span>

                    {completed ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : unlocked ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/30">
                        Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-white/10">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold font-devotional text-white mb-1">
                    {level.name}
                  </h3>
                  <div className="text-xs text-amber-400/80 font-medium mb-3">
                    {level.teluguName}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-2">
                    {level.subtitle}
                  </p>

                  {/* Objective pill */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Target Distance:</span>
                      <span className="font-semibold text-white">{level.targetDistance}m</span>
                    </div>
                    {level.requiredTrash > 0 ? (
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Required Waste:</span>
                        <span className="font-semibold text-cyan-300">{level.requiredTrash} items</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Sanctum:</span>
                        <span className="font-semibold text-rose-300">Immersion Destination</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Completion Bonus:</span>
                      <span className="font-semibold text-amber-400">+{level.punyaBonus} Punya</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom / Stats & Action */}
                <div className="pt-3 border-t border-white/10">
                  {unlocked ? (
                    <div>
                      {completed && (
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                          <span className="flex items-center gap-1 text-amber-300">
                            <Star className="w-3.5 h-3.5 fill-amber-300" /> Best: {bestScore}
                          </span>
                          <span className="flex items-center gap-1 text-cyan-300">
                            <Trash2 className="w-3.5 h-3.5" /> Cleaned: {bestTrash}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectLevel(level.id);
                        }}
                        className="w-full py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        {completed ? 'Replay Level' : 'Start Journey'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2.5 text-xs text-slate-500 font-medium">
                      <Lock className="w-4 h-4" />
                      <span>Complete Level {level.id - 1} to unlock</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
