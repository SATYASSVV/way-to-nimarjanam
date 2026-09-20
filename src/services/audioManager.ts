import { AudioSettings } from '../types/game';
import { StorageManager } from './storageManager';

class DevotionalAudioManager {
  private audioCtx: AudioContext | null = null;
  private isInitialized = false;
  private bgmAudioElement: HTMLAudioElement | null = null;
  private isPlayingBgm = false;
  private vocalTimer: number | null = null;
  private vocalIndex = 0;
  private settings: AudioSettings;

  // Custom audio track state
  public customTrackLoaded: boolean = false;
  public customTrackName: string = 'No custom MP3 loaded (using ambient chime fallback)';
  private statusListeners: Array<() => void> = [];

  // Synthesizer nodes
  private tanpuraGain: GainNode | null = null;
  private waterGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private tanpuraOscillators: OscillatorNode[] = [];
  private waterSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.settings = StorageManager.loadProgress().settings;

    // Handle visibility changes
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAll();
        } else if (this.isPlayingBgm && this.settings.soundEnabled) {
          this.resumeBgm();
        }
      });
    }
  }

  public subscribeStatus(listener: () => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private notifyStatus(): void {
    this.statusListeners.forEach(l => {
      try { l(); } catch (_) {}
    });
  }

  public initOnUserGesture(): void {
    if (this.isInitialized) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.settings.soundEnabled ? 1.0 : 0.0;
      this.masterGain.connect(this.audioCtx.destination);

      this.isInitialized = true;
      this.setupCustomAudioElement();
    } catch (e) {
      console.warn('Web Audio Context initialization deferred or not supported', e);
    }
  }

  private setupCustomAudioElement(): void {
    const audio = new Audio('/audio/ganapathi-vocals.mp3');
    audio.loop = true;
    audio.volume = this.settings.musicVolume;

    audio.addEventListener('error', () => {
      // Optional vocals-only file is absent; browser vocal chants remain available.
      this.customTrackLoaded = false;
      this.customTrackName = 'Browser vocal chant fallback (no vocal file loaded)';
      this.bgmAudioElement = null;
      this.notifyStatus();
    });

    audio.addEventListener('canplaythrough', () => {
      this.bgmAudioElement = audio;
      this.customTrackLoaded = true;
      this.customTrackName = 'ganapathi-vocals.mp3 (Vocals Only)';
      this.notifyStatus();
      if (this.isPlayingBgm && this.settings.soundEnabled) {
        audio.play().catch(() => {});
      }
    });

    audio.load();
  }

  public loadLocalAudioFile(file: File): void {
    try {
      if (this.bgmAudioElement) {
        this.bgmAudioElement.pause();
      }
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = this.settings.musicVolume;

      audio.addEventListener('canplaythrough', () => {
        this.bgmAudioElement = audio;
        this.customTrackLoaded = true;
        this.customTrackName = file.name;
        this.notifyStatus();

        if (this.isPlayingBgm && this.settings.soundEnabled) {
          audio.play().catch(() => {});
        }
      });

      audio.load();
    } catch (e) {
      console.error('Failed to load local audio file', e);
    }
  }

  public startBgm(): void {
    this.initOnUserGesture();
    this.isPlayingBgm = true;

    if (!this.settings.soundEnabled) return;

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.bgmAudioElement && this.customTrackLoaded) {
      this.stopProceduralDrone();
      this.bgmAudioElement.volume = this.settings.musicVolume;
      this.bgmAudioElement.play().catch(() => {
        this.playVocalChant();
      });
    } else {
      this.playVocalChant();
    }
  }

  public pauseBgm(): void {
    this.isPlayingBgm = false;
    if (this.bgmAudioElement) {
      this.bgmAudioElement.pause();
    }
    this.stopProceduralDrone();
    this.stopWaterAmbience();
    this.cancelVocalChant();
  }

  public resumeBgm(): void {
    if (this.settings.soundEnabled) {
      this.startBgm();
    }
  }

  public pauseAll(): void {
    if (this.bgmAudioElement) {
      this.bgmAudioElement.pause();
    }
    this.stopProceduralDrone();
    this.stopWaterAmbience();
    this.cancelVocalChant();
  }

  public setSoundEnabled(enabled: boolean): void {
    this.settings.soundEnabled = enabled;
    StorageManager.updateSettings({ soundEnabled: enabled });

    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(enabled ? 1.0 : 0.0, this.audioCtx.currentTime);
    }

    if (enabled && this.isPlayingBgm) {
      this.resumeBgm();
    } else if (!enabled) {
      if (this.bgmAudioElement) {
        this.bgmAudioElement.pause();
      }
      this.stopProceduralDrone();
      this.stopWaterAmbience();
      this.cancelVocalChant();
    }
  }

  public setMusicVolume(volume: number): void {
    this.settings.musicVolume = volume;
    StorageManager.updateSettings({ musicVolume: volume });

    if (this.bgmAudioElement) {
      this.bgmAudioElement.volume = volume;
    }
    if (this.tanpuraGain && this.audioCtx) {
      this.tanpuraGain.gain.setValueAtTime(volume * 0.22, this.audioCtx.currentTime);
    }
  }

  public setSfxVolume(volume: number): void {
    this.settings.sfxVolume = volume;
    StorageManager.updateSettings({ sfxVolume: volume });
  }

  private scheduleVocalChant(delay: number): void {
    if (!this.settings.soundEnabled || !this.isPlayingBgm || typeof window === 'undefined') return;
    if (this.vocalTimer !== null) window.clearTimeout(this.vocalTimer);
    this.vocalTimer = window.setTimeout(() => this.playVocalChant(), delay);
  }

  private cancelVocalChant(): void {
    if (this.vocalTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.vocalTimer);
    }
    this.vocalTimer = null;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  private playVocalChant(): void {
    if (!this.settings.soundEnabled || !this.isPlayingBgm || typeof window === 'undefined' || !window.speechSynthesis) return;

    const phrases = ['Ganapathi Bappa Morya!', 'Jai Ganesh!'];
    const utterance = new SpeechSynthesisUtterance(phrases[this.vocalIndex % phrases.length]);
    utterance.volume = Math.min(1, this.settings.sfxVolume * 0.65);
    utterance.rate = 0.82 + Math.random() * 0.12;
    utterance.pitch = 0.9 + Math.random() * 0.15;
    this.vocalIndex += 1;
    window.speechSynthesis.speak(utterance);
    this.scheduleVocalChant(12000 + Math.random() * 7000);
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  // --- Procedural Devotional Tanpura Drone Synth (Fallback Ambience) ---
  private startProceduralDrone(): void {
    if (!this.audioCtx || !this.masterGain || this.tanpuraOscillators.length > 0) return;

    this.tanpuraGain = this.audioCtx.createGain();
    this.tanpuraGain.gain.setValueAtTime(this.settings.musicVolume * 0.25, this.audioCtx.currentTime);
    this.tanpuraGain.connect(this.masterGain);

    // Devotional frequencies (Sa - Pa - Sa' meditative harmonics)
    const baseFreqs = [138.59, 138.59 * 1.5, 138.59 * 2, 138.59 * 2.25]; // C#3 Sa, G#3 Pa, C#4 Sa'

    this.tanpuraOscillators = baseFreqs.map((freq, i) => {
      const osc = this.audioCtx!.createOscillator();
      const panner = typeof this.audioCtx!.createStereoPanner === 'function' 
        ? this.audioCtx!.createStereoPanner() 
        : null;
      const gain = this.audioCtx!.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), this.audioCtx!.currentTime);

      // Subtle chorusing LFO
      const lfo = this.audioCtx!.createOscillator();
      const lfoGain = this.audioCtx!.createGain();
      lfo.frequency.value = 0.2 + i * 0.05;
      lfoGain.gain.value = 1.2;
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.value = 0.35 / (i + 1);

      if (panner) {
        panner.pan.value = (i % 2 === 0 ? -0.4 : 0.4);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.tanpuraGain!);
      } else {
        osc.connect(gain);
        gain.connect(this.tanpuraGain!);
      }

      osc.start();
      return osc;
    });
  }

  private stopProceduralDrone(): void {
    this.tanpuraOscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (_) {}
    });
    this.tanpuraOscillators = [];
    if (this.tanpuraGain) {
      try { this.tanpuraGain.disconnect(); } catch (_) {}
      this.tanpuraGain = null;
    }
  }

  // --- River Flow Water Ambience ---
  private startWaterAmbience(): void {
    if (!this.audioCtx || !this.masterGain || this.waterSource) return;

    try {
      const bufferSize = this.audioCtx.sampleRate * 2;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.15;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      this.waterGain = this.audioCtx.createGain();
      this.waterGain.gain.setValueAtTime(this.settings.musicVolume * 0.15, this.audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.waterGain);
      this.waterGain.connect(this.masterGain);

      whiteNoise.start();
      this.waterSource = whiteNoise;
    } catch (e) {
      console.warn('Water ambience generator fallback', e);
    }
  }

  private stopWaterAmbience(): void {
    if (this.waterSource) {
      try { this.waterSource.stop(); this.waterSource.disconnect(); } catch (_) {}
      this.waterSource = null;
    }
    if (this.waterGain) {
      try { this.waterGain.disconnect(); } catch (_) {}
      this.waterGain = null;
    }
  }

  // --- Sound Effects (SFX) ---
  public playCollectTrash(): void {
    if (!this.settings.soundEnabled || !this.audioCtx || !this.masterGain) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);

      gain.gain.setValueAtTime(this.settings.sfxVolume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (_) {}
  }

  public playCollectEco(): void {
    if (!this.settings.soundEnabled || !this.audioCtx || !this.masterGain) return;

    try {
      const now = this.audioCtx.currentTime;
      [783.99, 1046.50].forEach((freq, i) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(this.settings.sfxVolume * 0.4, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.6);
      });
    } catch (_) {}
  }

  public playObstacleHit(): void {
    if (!this.settings.soundEnabled || !this.audioCtx || !this.masterGain) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

      gain.gain.setValueAtTime(this.settings.sfxVolume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  public playCheckpoint(): void {
    if (!this.settings.soundEnabled || !this.audioCtx || !this.masterGain) return;

    try {
      const notes = [523.25, 587.33, 659.25, 783.99];
      const now = this.audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(this.settings.sfxVolume * 0.45, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.5);
      });
    } catch (_) {}
  }

  public playLevelComplete(): void {
    if (!this.settings.soundEnabled || !this.audioCtx || !this.masterGain) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const now = this.audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(this.settings.sfxVolume * 0.5, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.8);
      });
    } catch (_) {}
  }
}

export const audioManager = new DevotionalAudioManager();
