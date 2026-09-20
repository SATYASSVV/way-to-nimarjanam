import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, AlertTriangle, X, Sliders, CheckCircle, Music, Upload, FileAudio, Info } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from '../../services/audioManager';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, closeSettings, progress, resetAllProgress, restartLevel, screen } = useGameStore();
  const [soundEnabled, setSoundEnabled] = useState(progress.settings.soundEnabled);
  const [musicVolume, setMusicVolume] = useState(progress.settings.musicVolume);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [customAudioStatus, setCustomAudioStatus] = useState({
    loaded: audioManager.customTrackLoaded,
    name: audioManager.customTrackName,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = audioManager.subscribeStatus(() => {
      setCustomAudioStatus({
        loaded: audioManager.customTrackLoaded,
        name: audioManager.customTrackName,
      });
    });
    return unsubscribe;
  }, []);

  if (!isSettingsOpen) return null;

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioManager.setSoundEnabled(next);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVolume(val);
    audioManager.setMusicVolume(val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      audioManager.loadLocalAudioFile(file);
    }
  };

  const handleRestart = () => {
    setShowRestartConfirm(false);
    closeSettings();
    restartLevel(false);
  };

  const handleResetData = () => {
    resetAllProgress();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      closeSettings();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 overflow-hidden rounded-3xl glass-panel border border-amber-500/30 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold tracking-wide font-devotional text-amber-300">
              Game Settings & Audio
            </h2>
          </div>
          <button
            onClick={closeSettings}
            className="p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          {/* Sound toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-rose-400" />
              )}
              <div>
                <div className="text-sm font-semibold">Sound & Music</div>
                <div className="text-xs text-white/50">Devotional vocals and river ambience</div>
              </div>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>Music Volume</span>
              <span className="font-semibold text-amber-400">{Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVolume}
              onChange={handleVolumeChange}
              disabled={!soundEnabled}
              className="w-full h-2 rounded-lg bg-slate-700 accent-amber-500 cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Telugu Devotional Audio Source Card */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Telugu Devotional Audio Track
                </span>
              </div>
              {customAudioStatus.loaded ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                  MP3 Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                  Vocal Chant Fallback
                </span>
              )}
            </div>

            <div className="text-xs text-slate-300 flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
              <FileAudio className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium text-white truncate max-w-[280px]">
                  {customAudioStatus.loaded ? (
                    <span className="text-emerald-300 font-semibold">{customAudioStatus.name}</span>
                  ) : (
                    <span className="text-amber-200/90">Browser Ganapathi vocal chants</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {customAudioStatus.loaded
                    ? 'Playing selected Telugu Vinayaka devotional audio.'
                    : 'To play authentic Telugu devotional songs, place vinayaka-devotional.mp3 in public/audio/ or select a file below.'}
                </div>
              </div>
            </div>

            {/* Select Local MP3 File directly */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select Telugu Devotional MP3 File</span>
              </button>
            </div>
          </div>

          {/* In-game Restart Option */}
          {screen === 'playing' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-amber-300">Restart Current Level</div>
                  <div className="text-xs text-white/50">Start this level from beginning</div>
                </div>
                <button
                  onClick={() => setShowRestartConfirm(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restart
                </button>
              </div>

              {showRestartConfirm && (
                <div className="mt-3 p-3 rounded-xl bg-black/40 border border-amber-500/40 text-xs space-y-2">
                  <p className="text-amber-200">Restart current level from 0m? (Progress on this run will reset)</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRestartConfirm(false)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRestart}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium"
                    >
                      Confirm Restart
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset All Progress (New Game) */}
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-rose-300">Reset Campaign Progress</div>
                <div className="text-xs text-white/50">Clear unlocked levels & Punya records</div>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-200 bg-rose-900/60 hover:bg-rose-800 rounded-xl transition-all border border-rose-500/30 flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Reset
              </button>
            </div>

            {showResetConfirm && (
              <div className="mt-3 p-3 rounded-xl bg-black/60 border border-rose-500/40 text-xs space-y-2">
                <p className="text-rose-200 font-medium">
                  Are you sure? This will lock levels 2-5 and reset your high scores. Your audio settings will be kept.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetData}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium shadow"
                  >
                    Yes, Reset Everything
                  </button>
                </div>
              </div>
            )}

            {resetSuccess && (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Progress has been reset!
              </div>
            )}
          </div>
        </div>

        {/* Close / Resume button */}
        <div className="mt-5 pt-3 border-t border-white/10">
          <button
            onClick={closeSettings}
            className="w-full py-2.5 rounded-2xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
