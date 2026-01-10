// Game Types and Interfaces

export interface Vector2 {
  x: number;
  y: number;
}

export interface Hull {
  id: string;
  name: string;
  description: string;
  baseHealth: number;
  baseSpeed: number;
  baseArmor: number;
  price: number;
  upgradeLevel: number; // M0-M20
  sprite: string;
  color: string;
}

export interface Gun {
  id: string;
  name: string;
  description: string;
  baseDamage: number;
  fireRate: number; // shots per second
  reloadTime: number; // ms
  projectileSpeed: number;
  price: number;
  upgradeLevel: number; // M0-M20
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
}

export interface PlayerData {
  id: string;
  username: string;
  money: number;
  ownedHulls: string[];
  ownedGuns: string[];
  equippedHull: string;
  equippedGun: string;
  hullUpgrades: Record<string, number>; // hullId -> upgrade level
  gunUpgrades: Record<string, number>; // gunId -> upgrade level
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

// Message types for client-server communication
export type ClientMessage =
  | { type: 'join'; username: string }
  | { type: 'move'; direction: Vector2 }
  | { type: 'rotate'; angle: number }
  | { type: 'rotateTurret'; angle: number }
  | { type: 'shoot' }
  | { type: 'interact' } // E key for flag
  | { type: 'getGarage' }
  | { type: 'buyHull'; hullId: string }
  | { type: 'buyGun'; gunId: string }
  | { type: 'upgradeHull'; hullId: string }
  | { type: 'upgradeGun'; gunId: string }
  | { type: 'equipHull'; hullId: string }
  | { type: 'equipGun'; gunId: string };

export type ServerMessage =
  | { type: 'welcome'; playerId: string; playerData: PlayerData }
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
  | { type: 'error'; message: string };
