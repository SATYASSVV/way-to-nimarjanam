import React from 'react';
import { Home, Settings, Play, Map, Sparkles, Waves, ShieldCheck } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const LandingPage: React.FC = () => {
  const { startLevel, openSettings, setScreen, progress, returnHome } = useGameStore();

  const handleStartHere = () => {
    // Starts the game with sound after explicit user gesture!
    // Start from Level 1 or continue from checkpoint if available
    if (progress.savedCheckpoint) {
      startLevel(progress.savedCheckpoint.levelId, true);
    } else {
      startLevel(1, false);
    }
  };

  const hasProgress = progress.completedLevels.length > 0 || progress.savedCheckpoint !== null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-sacred-dark select-none">
      {/* Background with exact uploaded image */}
      <div 
        className="absolute inset-0 w-full h-full bg-no-repeat transition-all duration-700 pointer-events-none"
        style={{
          backgroundImage: `url('/bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
        }}
      />

      {/* Subtle responsive gradient overlay on left to ensure maximum readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10 md:to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="relative z-20 flex items-center justify-between w-full p-4 md:p-8">
        {/* Left Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Om Sri Maha Ganapataye Namah</span>
        </div>

        {/* Top-Right Circular Glassmorphism Icons */}
        <div className="flex items-center gap-3">
          {/* Home Button */}
          <button
            onClick={returnHome}
            title="Home"
            aria-label="Home"
            className="w-11 h-11 rounded-full glass-circle flex items-center justify-center text-white/90 hover:text-amber-300 hover:border-amber-400/50 transition-all duration-300 active:scale-95 shadow-lg group"
          >
            <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>

          {/* Settings Button */}
          <button
            onClick={openSettings}
            title="Settings"
            aria-label="Settings"
            className="w-11 h-11 rounded-full glass-circle flex items-center justify-center text-white/90 hover:text-amber-300 hover:border-amber-400/50 transition-all duration-300 active:scale-95 shadow-lg group"
          >
            <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
          </button>
        </div>
      </header>

      {/* Hero Left Content */}
      <main className="relative z-10 flex flex-col justify-center h-[calc(100vh-100px)] px-6 md:px-16 lg:px-24 max-w-2xl text-left">
        {/* Tagline */}
        <div className="mb-2 inline-block">
          <span className="text-xs md:text-sm font-bold tracking-[0.25em] text-amber-400 font-devotional uppercase drop-shadow">
            ECO DEVOTIONAL GAME
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-devotional text-white tracking-tight leading-[1.08] drop-shadow-2xl">
          WAY TO <br />
          <span className="text-gold-gradient">NIMARJANAM</span>
        </h1>

        {/* Description */}
        <p className="mt-4 md:mt-6 text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed max-w-lg drop-shadow">
          Carry Vinayaka from the Krishna River to the ocean. Clean the river, collect Punya, and protect nature.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-4">
          {/* Glowing START HERE button */}
          <button
            onClick={handleStartHere}
            className="group relative px-8 md:px-10 py-4 rounded-2xl font-extrabold text-white text-base md:text-lg tracking-wide uppercase shadow-2xl transition-all duration-300 active:scale-95 flex items-center gap-3 overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 hover:from-orange-400 hover:via-amber-400 hover:to-pink-400 animate-pulse-glow"
          >
            <Play className="w-5 h-5 fill-white transition-transform group-hover:scale-125" />
            <span>START HERE</span>
          </button>

          {/* Level Select Button */}
          <button
            onClick={() => setScreen('level_select')}
            className="px-6 py-4 rounded-2xl font-bold text-white/90 text-sm md:text-base tracking-wide glass-card hover:bg-white/15 hover:border-amber-400/50 transition-all duration-300 active:scale-95 flex items-center gap-2.5 shadow-lg"
          >
            <Map className="w-4 h-4 text-amber-400" />
            <span>Select Level</span>
          </button>
        </div>

        {/* Campaign Stats Card if player has saved records */}
        {hasProgress && (
          <div className="mt-8 p-3.5 rounded-2xl glass-card max-w-md border-amber-500/20 text-xs text-white/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Campaign Record:</span> {progress.totalPunya} Punya | {progress.totalTrash} Waste Cleaned
              </div>
            </div>
            {progress.savedCheckpoint && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium text-[11px]">
                Checkpoint Active
              </span>
            )}
          </div>
        )}

        {/* Eco Motto Footer Quote */}
        <div className="mt-6 flex items-center gap-2 text-xs text-white/50">
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          <span>Clay Ganesha dissolves naturally — Keep our rivers and oceans clean</span>
        </div>
      </main>
    </div>
  );
};
