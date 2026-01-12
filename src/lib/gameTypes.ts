// Game Types and Interfaces

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rank {
  id: number;
  name: string;
  minXP: number;
  color: string;
  icon: string;
}

export interface NextRankInfo {
  rank: Rank;
  xpNeeded: number;
  progress: number;
}

export interface Hull {
  id: string;
  name: string;
  description: string;
  baseHealth: number;
  baseSpeed: number;
  baseArmor: number;
  price: number;
  upgradeLevel: number;
  sprite: string;
  color: string;
}

export interface Gun {
  id: string;
  name: string;
  description: string;
  baseDamage: number;
  fireRate: number;
  reloadTime: number;
  projectileSpeed: number;
  price: number;
  upgradeLevel: number;
  shotEffect: 'normal' | 'explosive' | 'laser' | 'plasma' | 'railgun';
  shotColor: string;
  sprite: string;
}

export interface Player {
  id: string;
  username: string;
  position: Vector2;
  rotation: number;
  turretRotation: number;
  health: number;
  maxHealth: number;
  team: 'red' | 'blue';
  hull: Hull;
  gun: Gun;
  hasFlag: boolean;
  isAlive: boolean;
  xp?: number;
  rank?: Rank;
}

export interface Flag {
  id: string;
  team: 'red' | 'blue';
  position: Vector2;
  isAtBase: boolean;
  carriedBy: string | null;
}

export interface Projectile {
  id: string;
  ownerId: string;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  effect: Gun['shotEffect'];
  color: string;
}

export interface Wall {
  id: string;
  position: Vector2;
  width: number;
  height: number;
  type: 'solid' | 'destructible';
  health?: number;
}

export interface GameStats {
  kills: number;
  deaths: number;
  flagCaptures: number;
  flagReturns: number;
  damageDealt: number;
  wins?: number;
  losses?: number;
  gamesPlayed?: number;
}

export interface PlayerData {
  id: string;
  username: string;
  money: number;
  xp: number;
  rank?: Rank;
  nextRank?: NextRankInfo | null;
  ownedHulls: string[];
  ownedGuns: string[];
  equippedHull: string;
  equippedGun: string;
  hullUpgrades: Record<string, number>;
  gunUpgrades: Record<string, number>;
  stats: GameStats;
}

export interface GameState {
  players: Player[];
  flags: Flag[];
  projectiles: Projectile[];
  walls: Wall[];
  redScore: number;
  blueScore: number;
  timeRemaining: number;
  isRunning: boolean;
}

export interface ServerConfig {
  host: string;
  port: number;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

// Message types for client-server communication
export type ClientMessage =
  | { type: 'register'; username: string; password: string }
  | { type: 'login'; username: string; password: string }
  | { type: 'joinBattle'; sessionToken: string }
  | { type: 'leaveBattle' }
  | { type: 'move'; direction: Vector2 }
  | { type: 'rotate'; angle: number }
  | { type: 'rotateTurret'; angle: number }
  | { type: 'shoot' }
  | { type: 'interact' }
  | { type: 'getGarage'; sessionToken: string }
  | { type: 'buyHull'; sessionToken: string; hullId: string }
  | { type: 'buyGun'; sessionToken: string; gunId: string }
  | { type: 'upgradeHull'; sessionToken: string; hullId: string }
  | { type: 'upgradeGun'; sessionToken: string; gunId: string }
  | { type: 'equipHull'; sessionToken: string; hullId: string }
  | { type: 'equipGun'; sessionToken: string; gunId: string };

export type ServerMessage =
  | { type: 'authSuccess'; sessionToken: string; playerData: PlayerData }
  | { type: 'battleJoined'; playerId: string; team: 'red' | 'blue'; playerData: PlayerData }
  | { type: 'gameState'; state: GameState }
  | { type: 'playerJoined'; player: Player }
  | { type: 'playerLeft'; playerId: string }
  | { type: 'playerKilled'; killerId: string; victimId: string }
  | { type: 'flagPickup'; playerId: string; flagTeam: 'red' | 'blue' }
  | { type: 'flagCapture'; playerId: string; team: 'red' | 'blue' }
  | { type: 'flagReturn'; playerId: string; flagTeam: 'red' | 'blue' }
  | { type: 'garageData'; hulls: Hull[]; guns: Gun[]; playerData: PlayerData }
  | { type: 'purchaseResult'; success: boolean; message: string; playerData?: PlayerData }
  | { type: 'upgradeResult'; success: boolean; message: string; playerData?: PlayerData }
  | { type: 'rankUp'; oldRank: Rank; newRank: Rank; newXP: number }
  | { type: 'xpGain'; amount: number; newXP: number; currentRank: Rank; nextRank: NextRankInfo | null }
  | { type: 'error'; message: string };

// XP Gain Event for UI
export interface XPGainEvent {
  amount: number;
  newXP: number;
  currentRank: Rank;
  nextRank: NextRankInfo | null;
}

// Rank Up Event for UI
export interface RankUpEvent {
  oldRank: Rank;
  newRank: Rank;
}
