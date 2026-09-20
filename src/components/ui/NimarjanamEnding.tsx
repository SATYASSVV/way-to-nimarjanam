import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Award, RotateCcw, Home, Compass, Waves, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { GameCanvas } from '../game/GameCanvas';

export const NimarjanamEnding: React.FC = () => {
  const {
    progress,
    score,
    trashCollected,
    ecoCollected,
    startLevel,
    returnHome,
    resetAllProgress,
  } = useGameStore();

  const [phase, setPhase] = useState<'immersion' | 'summary'>('immersion');
  const [immersionProgress, setImmersionProgress] = useState(0);

  // Devotional immersion animation step
  useEffect(() => {
    const interval = setInterval(() => {
      setImmersionProgress((prev) => {
        if (prev >= 1.0) {
          clearInterval(interval);
          setTimeout(() => setPhase('summary'), 1800);
          return 1.0;
        }
        return prev + 0.035;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase === 'summary') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#ec4899', '#f97316', '#38bdf8', '#fbbf24'],
        });
      } catch (_) {}
    }
  }, [phase]);

  const totalDistance = 1000 + 1500 + 2000 + 2500 + 1000; // 8,000 meters total
  const totalTrash = progress.totalTrash || trashCollected;
  const totalEco = progress.totalEco || ecoCollected;
  const totalPunya = progress.totalPunya || score;

  const handlePlayAgain = () => {
    startLevel(1, false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-sacred-dark text-white select-none">
      {/* 3D Cinematic Ocean Background */}
      <div className="absolute inset-0 z-0">
        <GameCanvas cinematicMode={true} />
      </div>

      {/* Warm Devotional Sunset Cinematic Tint Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-amber-950/30 to-black/40 pointer-events-none" />

      {/* PHASE 1: Respectful Immersion Ceremony */}
      {phase === 'immersion' && (
        <div className="relative z-20 flex flex-col items-center justify-between h-full p-6 sm:p-10 text-center animate-fadeIn">
          {/* Top Devotional Mantra */}
          <div className="space-y-1">
            <div className="px-4 py-1.5 rounded-full glass-card border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold tracking-widest uppercase">
              GANAPATHI BAPPA MORYA! PUDHCHYA VARSHI LAVKAR YA!
            </div>
            <p className="text-xs text-amber-200/80 mt-1 font-devotional">
              (ఓం గం గణపతయే నమః — మళ్ళీ వచ్చే ఏడాది త్వరగా రండి స్వామి)
            </p>
          </div>

          {/* Middle Immersion Progress Card */}
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-amber-500/40 text-center space-y-4 shadow-2xl">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-amber-500/20 text-amber-300 animate-pulse">
                <Waves className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <h3 className="text-2xl font-bold font-devotional text-amber-300">
              Sacred Eco-Friendly Nimarjanam
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Lord Vinayaka, sculpted lovingly with sacred Krishna river clay, gently returns to the ocean waters.
              Pure clay dissolves naturally, nurturing aquatic life without chemical pollutants.
            </p>

            {/* Immersion Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-amber-300 font-semibold">
                <span>Immersion Ceremony</span>
                <span>{Math.round(immersionProgress * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all duration-300"
                  style={{ width: `${immersionProgress * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Skip to Summary */}
          <button
            onClick={() => setPhase('summary')}
            className="text-xs text-slate-400 hover:text-white px-4 py-2 rounded-xl glass-card transition-colors"
          >
            Skip to Campaign Summary &rarr;
          </button>
        </div>
      )}

      {/* PHASE 2: Grand Campaign Summary & Eco Devotional Message */}
      {phase === 'summary' && (
        <div className="relative z-20 flex items-center justify-center h-full p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/50 text-center shadow-2xl space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-widest uppercase">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              GRAND CAMPAIGN COMPLETED
            </div>

            {/* Title */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-black font-devotional text-amber-300 leading-tight">
                DEVOTIONAL VOYAGE ACCOMPLISHED
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                You safely carried Lord Vinayaka from the Krishna River to the Ocean Sanctum!
              </p>
            </div>

            {/* Critical Required Message */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 border border-amber-400/40 shadow-inner">
              <p className="text-base sm:text-lg font-black font-devotional text-white drop-shadow">
                "You cleaned <span className="text-cyan-300">{totalTrash}</span> trash, Earned{' '}
                <span className="text-amber-300">{totalPunya}</span> Punya — Protect our rivers."
              </p>
              <p className="text-xs text-amber-200/80 mt-1 font-medium">
                (మీరు {totalTrash} చెత్తను శుభ్రం చేశారు, {totalPunya} పుణ్యం సంపాదించారు — మన నదులను కాపాడుకోండి)
              </p>
            </div>

            {/* Comprehensive Campaign Statistics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs text-left">
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                <span className="text-slate-400 block mb-0.5">Total Distance Escorted</span>
                <span className="text-base font-black text-white">{totalDistance.toLocaleString()} m</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                <span className="text-slate-400 block mb-0.5">Total Waste Cleaned</span>
                <span className="text-base font-black text-cyan-300">{totalTrash} Items</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                <span className="text-slate-400 block mb-0.5">Sacred Eco Items</span>
                <span className="text-base font-black text-pink-300">{totalEco} Items</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                <span className="text-slate-400 block mb-0.5">Grand Punya Score</span>
                <span className="text-base font-black text-amber-400">{totalPunya} Punya</span>
              </div>
            </div>

            {/* Levels Completed Checklist */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-left space-y-1.5">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                All 5 Holy Waters Consecrated:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-300">
                <span>&#10003; Level 1: Krishna River Beginning</span>
                <span>&#10003; Level 2: Village River Ghats</span>
                <span>&#10003; Level 3: River Cleanup Challenge</span>
                <span>&#10003; Level 4: River Meets The Sea</span>
                <span className="col-span-1 sm:col-span-2 text-amber-300 font-semibold">
                  &#10003; Level 5: Sacred Ocean Nimarjanam
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handlePlayAgain}
                className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Campaign Again</span>
              </button>

              <button
                onClick={() => startLevel(5, false)}
                className="w-full py-2.5 rounded-2xl font-semibold text-xs uppercase tracking-wider glass-card hover:bg-white/10 text-white/90 flex items-center justify-center gap-2 transition-colors"
              >
                <span>Replay Ocean Nimarjanam (Level 5)</span>
              </button>

              <button
                onClick={returnHome}
                className="w-full py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
