import { create } from 'zustand';
import { GameScreen, LevelConfig, ActiveItem, ScoreNotification, GameProgress, CheckpointData, DebugTelemetry } from '../types/game';
import { LEVELS, SCORING_RULES } from '../data/levelsConfig';
import { StorageManager } from '../services/storageManager';
import { audioManager } from '../services/audioManager';

interface GameState {
  screen: GameScreen;
  currentLevelId: number;
  currentLevel: LevelConfig;
  progress: GameProgress;
  isSettingsOpen: boolean;
  reducedEffects: boolean;

  // In-run state
  distanceTravelled: number;
  boatX: number;
  boatVelocityX: number;
  boatSteer: number;
  score: number;
  trashCollected: number;
  ecoCollected: number;
  health: number;
  isInvulnerable: boolean;
  invulnerableTime: number;
  isPaused: boolean;
  isGameOver: boolean;
  isLevelCompleted: boolean;
  checkpointPassed: boolean;
  checkpointToast: string | null;

  activeItems: ActiveItem[];
  scoreNotifications: ScoreNotification[];
  debugMode: boolean;
  debugTelemetry: DebugTelemetry;

  // Actions
  setScreen: (screen: GameScreen) => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleReducedEffects: () => void;
  selectLevel: (levelId: number) => void;
  startLevel: (levelId?: number, fromCheckpoint?: boolean) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartLevel: (fromCheckpoint?: boolean) => void;
  returnHome: () => void;
  setBoatSteer: (steer: number) => void;
  setBoatTargetX: (x: number) => void;
  tickGame: (delta: number) => void;
  collectItem: (item: ActiveItem) => void;
  removeScoreNotification: (id: string) => void;
  triggerDamage: () => void;
  triggerLevelComplete: () => void;
  resetAllProgress: () => void;
  toggleDebugMode: () => void;
  setDebugTelemetry: (telemetry: DebugTelemetry) => void;
}

export const useGameStore = create<GameState>((set, get) => {
  const initialProgress = StorageManager.loadProgress();

  return {
    screen: 'landing',
    currentLevelId: 1,
    currentLevel: LEVELS[0],
    progress: initialProgress,
    isSettingsOpen: false,
    reducedEffects: false,

    distanceTravelled: 0,
    boatX: 0,
    boatVelocityX: 0,
    boatSteer: 0,
    score: 0,
    trashCollected: 0,
    ecoCollected: 0,
    health: 3,
    isInvulnerable: false,
    invulnerableTime: 0,
    isPaused: false,
    isGameOver: false,
    isLevelCompleted: false,
    checkpointPassed: false,
    checkpointToast: null,
    activeItems: [],
    scoreNotifications: [],
    debugMode: false,
    debugTelemetry: {
      distanceTravelled: 0,
      forwardSpeed: 0,
      deltaTime: 0,
      boatX: 0,
      boatWorldPosition: [0, 0, 0],
      nearestCollectibleWorldPosition: null,
      nearestCollectibleDistance: null,
      collisionDetected: false,
    },

    setScreen: (screen) => set({ screen }),
    openSettings: () => set({ isSettingsOpen: true }),
    closeSettings: () => set({ isSettingsOpen: false }),
    toggleReducedEffects: () => set((state) => ({ reducedEffects: !state.reducedEffects })),
    toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),
    setDebugTelemetry: (debugTelemetry) => set({ debugTelemetry }),

    selectLevel: (levelId) => {
      const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
      set({
        currentLevelId: levelId,
        currentLevel: level,
        screen: 'intro',
      });
    },

    startLevel: (levelId, fromCheckpoint = false) => {
      const id = levelId ?? get().currentLevelId;
      const level = LEVELS.find((l) => l.id === id) || LEVELS[0];
      const savedCp = get().progress.savedCheckpoint;

      let initialDistanceTravelled = 0;
      let initialScore = 0;
      let initialTrash = 0;
      let initialEco = 0;
      let initialHealth = 3;
      let passedCp = false;

      if (fromCheckpoint && savedCp && savedCp.levelId === id) {
        const savedCheckpoint = savedCp as CheckpointData & { distance?: number };
        initialDistanceTravelled = savedCheckpoint.distanceTravelled ?? savedCheckpoint.distance ?? 0;
        initialScore = savedCp.score;
        initialTrash = savedCp.trashCollected;
        initialEco = savedCp.ecoCollected;
        initialHealth = savedCp.health;
        passedCp = true;
      }

      audioManager.startBgm();

      set({
        screen: 'playing',
        currentLevelId: id,
        currentLevel: level,
        distanceTravelled: initialDistanceTravelled,
        boatX: 0,
        boatVelocityX: 0,
        boatSteer: 0,
        score: initialScore,
        trashCollected: initialTrash,
        ecoCollected: initialEco,
        health: initialHealth,
        isInvulnerable: false,
        invulnerableTime: 0,
        isPaused: false,
        isGameOver: false,
        isLevelCompleted: false,
        checkpointPassed: passedCp,
        checkpointToast: null,
        activeItems: [],
        scoreNotifications: [],
      });
    },

    pauseGame: () => {
      audioManager.pauseBgm();
      set({ isPaused: true });
    },

    resumeGame: () => {
      audioManager.resumeBgm();
      set({ isPaused: false });
    },

    restartLevel: (fromCheckpoint = false) => {
      get().startLevel(get().currentLevelId, fromCheckpoint);
    },

    returnHome: () => {
      audioManager.pauseAll();
      set({
        screen: 'landing',
        isPaused: false,
        isGameOver: false,
        isLevelCompleted: false,
      });
    },

    setBoatSteer: (steer) => set({ boatSteer: steer }),

    setBoatTargetX: (targetX) => {
      const { currentLevel } = get();
      const maxClamp = (currentLevel.riverWidth / 2) - 1.2;
      const clamped = Math.max(-maxClamp, Math.min(maxClamp, targetX));
      set({ boatX: clamped, boatVelocityX: 0 });
    },

    triggerDamage: () => {
      const { health, isInvulnerable } = get();
      if (isInvulnerable) return;

      audioManager.playObstacleHit();
      const newHealth = health - 1;

      if (newHealth <= 0) {
        audioManager.pauseBgm();
        set({
          health: 0,
          isGameOver: true,
          screen: 'game_over',
        });
      } else {
        set({
          health: newHealth,
          isInvulnerable: true,
          invulnerableTime: 1.5,
        });
      }
    },

    collectItem: (item: ActiveItem) => {
      const { score, trashCollected, ecoCollected } = get();
      if (item.collected) return;

      item.collected = true;

      const addedPoints = item.points;
      const newTrash = item.isTrash ? trashCollected + 1 : trashCollected;
      const newEco = item.isEco ? ecoCollected + 1 : ecoCollected;
      const newScore = score + addedPoints;

      if (item.isEco) {
        audioManager.playCollectEco();
      } else {
        audioManager.playCollectTrash();
      }

      // Add floating score notification
      const notif: ScoreNotification = {
        id: `${Date.now()}_${Math.random()}`,
        text: `+${addedPoints}`,
        points: addedPoints,
        isEco: item.isEco,
        x: item.x,
        y: 1.5,
      };

      set((state) => ({
        score: newScore,
        trashCollected: newTrash,
        ecoCollected: newEco,
        scoreNotifications: [...state.scoreNotifications.slice(-4), notif],
      }));
    },

    removeScoreNotification: (id: string) => {
      set((state) => ({
        scoreNotifications: state.scoreNotifications.filter((notification) => notification.id !== id),
      }));
    },

    tickGame: (delta: number) => {
      const state = get();
      if (state.isPaused || state.isGameOver || state.isLevelCompleted || state.screen !== 'playing') {
        return;
      }

      const { currentLevel, distanceTravelled, boatX, boatVelocityX, boatSteer, health, score, trashCollected, ecoCollected, checkpointPassed } = state;

      // 1. Advance distance
      const speed = currentLevel.baseSpeed;
      const newDistanceTravelled = Math.min(
        currentLevel.targetDistance,
        distanceTravelled + speed * delta
      );

      // 2. Lateral boat steering physics
      const maxClamp = (currentLevel.riverWidth / 2) - 1.2;
      const targetVelocityX = boatSteer * 11.0;
      const velocityResponse = Math.min(1, delta * 8.0);
      const newBoatVelocityX = boatVelocityX + (targetVelocityX - boatVelocityX) * velocityResponse;
      let newBoatX = boatX + newBoatVelocityX * delta;
      newBoatX = Math.max(-maxClamp, Math.min(maxClamp, newBoatX));

      // 3. Invulnerability countdown
      let newInvul = state.isInvulnerable;
      let newInvulTime = state.invulnerableTime - delta;
      if (newInvulTime <= 0) {
        newInvul = false;
        newInvulTime = 0;
      }

      // 4. Checkpoint check
      let newCpPassed = checkpointPassed;
      let toastMsg = state.checkpointToast;

      if (!checkpointPassed && newDistanceTravelled >= currentLevel.checkpointDistance) {
        newCpPassed = true;
        toastMsg = `Checkpoint reached at ${currentLevel.checkpointDistance}m! Progress saved.`;
        audioManager.playCheckpoint();

        const cpData: CheckpointData = {
          levelId: currentLevel.id,
          distanceTravelled: currentLevel.checkpointDistance,
          score,
          trashCollected,
          ecoCollected,
          health,
        };
        const savedProgress = StorageManager.saveCheckpoint(cpData);
        set({ progress: savedProgress });
      }

      // 5. Level completion check
      if (newDistanceTravelled >= currentLevel.targetDistance) {
        // Required trash verification
        if (trashCollected >= currentLevel.requiredTrash) {
          get().triggerLevelComplete();
          return;
        }
      }

      set({
        distanceTravelled: newDistanceTravelled,
        boatX: newBoatX,
        boatVelocityX: newBoatVelocityX,
        isInvulnerable: newInvul,
        invulnerableTime: newInvulTime,
        checkpointPassed: newCpPassed,
        checkpointToast: toastMsg,
      });
    },

    triggerLevelComplete: () => {
      const { currentLevel, score, trashCollected, ecoCollected } = get();
      audioManager.pauseBgm();
      audioManager.playLevelComplete();

      const totalLevelScore = score + currentLevel.punyaBonus;
      const updatedProgress = StorageManager.saveLevelCompletion(
        currentLevel.id,
        totalLevelScore,
        trashCollected,
        ecoCollected
      );

      if (currentLevel.id === 5) {
        // Transition to peaceful Ocean Nimarjanam ceremony
        set({
          isLevelCompleted: true,
          score: totalLevelScore,
          progress: updatedProgress,
          screen: 'nimarjanam_ending',
        });
      } else {
        set({
          isLevelCompleted: true,
          score: totalLevelScore,
          progress: updatedProgress,
          screen: 'level_complete',
        });
      }
    },

    resetAllProgress: () => {
      const fresh = StorageManager.resetProgress(true);
      set({
        progress: fresh,
        currentLevelId: 1,
        currentLevel: LEVELS[0],
      });
    },
  };
});
