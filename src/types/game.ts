export type EnvironmentType = 
  | 'krishna_dawn'
  | 'village_ghat'
  | 'cleanup_challenge'
  | 'estuary_sea'
  | 'ocean_nimarjanam';

export type CollectibleType = 
  | 'plastic_cover'
  | 'plastic_bottle'
  | 'fishing_net'
  | 'lotus'
  | 'diya'
  | 'om_coin';

export type ObstacleType = 
  | 'log'
  | 'rock'
  | 'debris'
  | 'whirlpool';

export interface LevelConfig {
  id: number;
  name: string;
  teluguName: string;
  subtitle: string;
  description: string;
  targetDistance: number;       // In meters
  requiredTrash: number;        // Minimum waste items needed
  checkpointDistance: number;   // In meters
  punyaBonus: number;           // Bonus points on completion
  baseSpeed: number;            // Forward movement speed
  riverWidth: number;           // Lateral boundary
  environmentType: EnvironmentType;
  waterColor: string;
  waterDeepColor: string;
  bankColor: string;
  skyColor: string;
  fogColor: string;
  fogDensity: number;
  sunColor: string;
  ambientColor: string;
  currentStrength: number;
  trashFrequency: number;
  ecoFrequency: number;
  obstacleFrequency: number;
  narrativeTip: string;
}

export interface ActiveItem {
  id: string;
  type: CollectibleType | ObstacleType;
  x: number;
  z: number;
  previousZ?: number;
  yOffset?: number;
  scale?: number;
  rotation?: number;
  isObstacle: boolean;
  points: number;
  isTrash: boolean;
  isEco: boolean;
  collected?: boolean;
}

export interface CheckpointData {
  levelId: number;
  distanceTravelled: number;
  score: number;
  trashCollected: number;
  ecoCollected: number;
  health: number;
}

export interface AudioSettings {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

export interface GameProgress {
  unlockedLevels: number[];
  completedLevels: number[];
  bestScores: Record<number, number>;
  bestTrash: Record<number, number>;
  totalPunya: number;
  totalTrash: number;
  totalEco: number;
  savedCheckpoint: CheckpointData | null;
  settings: AudioSettings;
}

export type GameScreen = 
  | 'landing'
  | 'level_select'
  | 'intro'
  | 'playing'
  | 'game_over'
  | 'level_complete'
  | 'nimarjanam_ending';

export interface ScoreNotification {
  id: string;
  text: string;
  points: number;
  isEco: boolean;
  x: number;
  y: number;
}

export interface DebugTelemetry {
  distanceTravelled: number;
  forwardSpeed: number;
  deltaTime: number;
  boatX: number;
  boatWorldPosition: [number, number, number];
  nearestCollectibleWorldPosition: [number, number, number] | null;
  nearestCollectibleDistance: number | null;
  collisionDetected: boolean;
}
