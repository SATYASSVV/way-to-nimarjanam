import { GameProgress, CheckpointData, AudioSettings } from '../types/game';

const STORAGE_KEY = 'way_to_nimarjanam_save_v1';

const DEFAULT_SETTINGS: AudioSettings = {
  soundEnabled: true,
  musicVolume: 0.7,
  sfxVolume: 0.85,
};

const DEFAULT_PROGRESS: GameProgress = {
  unlockedLevels: [1],
  completedLevels: [],
  bestScores: {},
  bestTrash: {},
  totalPunya: 0,
  totalTrash: 0,
  totalEco: 0,
  savedCheckpoint: null,
  settings: DEFAULT_SETTINGS,
};

export class StorageManager {
  static loadProgress(): GameProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_PROGRESS;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_PROGRESS,
        ...parsed,
        unlockedLevels: Array.isArray(parsed.unlockedLevels) && parsed.unlockedLevels.length > 0 
          ? parsed.unlockedLevels 
          : [1],
        settings: {
          ...DEFAULT_SETTINGS,
          ...(parsed.settings || {})
        }
      };
    } catch (e) {
      console.error('Failed to load saved progress, using defaults', e);
      return DEFAULT_PROGRESS;
    }
  }

  static saveProgress(progress: GameProgress): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }

  static saveLevelCompletion(levelId: number, score: number, trash: number, eco: number): GameProgress {
    const current = this.loadProgress();
    const completedSet = new Set(current.completedLevels);
    completedSet.add(levelId);

    const unlockedSet = new Set(current.unlockedLevels);
    unlockedSet.add(levelId);
    if (levelId < 5) {
      unlockedSet.add(levelId + 1);
    }

    const updatedBestScore = Math.max(current.bestScores[levelId] || 0, score);
    const updatedBestTrash = Math.max(current.bestTrash[levelId] || 0, trash);

    const updated: GameProgress = {
      ...current,
      unlockedLevels: Array.from(unlockedSet).sort((a, b) => a - b),
      completedLevels: Array.from(completedSet).sort((a, b) => a - b),
      bestScores: {
        ...current.bestScores,
        [levelId]: updatedBestScore
      },
      bestTrash: {
        ...current.bestTrash,
        [levelId]: updatedBestTrash
      },
      totalPunya: current.totalPunya + score,
      totalTrash: current.totalTrash + trash,
      totalEco: current.totalEco + eco,
      savedCheckpoint: null, // Clear checkpoint once level is completed
    };

    this.saveProgress(updated);
    return updated;
  }

  static saveCheckpoint(checkpoint: CheckpointData): GameProgress {
    const current = this.loadProgress();
    current.savedCheckpoint = checkpoint;
    this.saveProgress(current);
    return current;
  }

  static clearCheckpoint(): void {
    const current = this.loadProgress();
    current.savedCheckpoint = null;
    this.saveProgress(current);
  }

  static updateSettings(settings: Partial<AudioSettings>): AudioSettings {
    const current = this.loadProgress();
    const updatedSettings = {
      ...current.settings,
      ...settings
    };
    current.settings = updatedSettings;
    this.saveProgress(current);
    return updatedSettings;
  }

  static resetProgress(preserveSettings: boolean = true): GameProgress {
    const current = this.loadProgress();
    const fresh: GameProgress = {
      ...DEFAULT_PROGRESS,
      settings: preserveSettings ? current.settings : DEFAULT_SETTINGS
    };
    this.saveProgress(fresh);
    return fresh;
  }
}
