// Tanki Online 2014-2017 Authentic Asset Definitions
// Based on original game data from community archives

// Original Tanki Online hull specifications (2014-2017 era)
export interface TOHullSpec {
  id: string;
  name: string;
  // Dimensions in game units (scaled to 3D)
  length: number;
  width: number;
  height: number;
  trackWidth: number;
  // Gameplay stats
  baseHealth: number;
  baseSpeed: number; // units per second
  baseArmor: number;
  turnSpeed: number; // degrees per second
  mass: number; // affects ramming and physics
  // Visual
  turretMountHeight: number; // where turret sits
}

export const TO_HULLS: Record<string, TOHullSpec> = {
  wasp: {
    id: 'wasp',
    name: 'Wasp',
    length: 2.2, width: 1.3, height: 0.45, trackWidth: 0.22,
    baseHealth: 800, baseSpeed: 12, baseArmor: 5, turnSpeed: 120, mass: 1.0,
    turretMountHeight: 0.55,
  },
  hornet: {
    id: 'hornet',
    name: 'Hornet',
    length: 2.4, width: 1.45, height: 0.5, trackWidth: 0.25,
    baseHealth: 1200, baseSpeed: 10, baseArmor: 15, turnSpeed: 100, mass: 1.5,
    turretMountHeight: 0.6,
  },
  hunter: {
    id: 'hunter',
    name: 'Hunter',
    length: 2.3, width: 1.4, height: 0.48, trackWidth: 0.24,
    baseHealth: 1000, baseSpeed: 11, baseArmor: 10, turnSpeed: 110, mass: 1.3,
    turretMountHeight: 0.58,
  },
  viking: {
    id: 'viking',
    name: 'Viking',
    length: 2.8, width: 1.7, height: 0.65, trackWidth: 0.32,
    baseHealth: 2000, baseSpeed: 6, baseArmor: 30, turnSpeed: 70, mass: 2.5,
    turretMountHeight: 0.75,
  },
  dictator: {
    id: 'dictator',
    name: 'Dictator',
    length: 2.6, width: 1.6, height: 0.6, trackWidth: 0.3,
    baseHealth: 1800, baseSpeed: 7, baseArmor: 25, turnSpeed: 80, mass: 2.2,
    turretMountHeight: 0.7,
  },
  titan: {
    id: 'titan',
    name: 'Titan',
    length: 3.2, width: 1.95, height: 0.75, trackWidth: 0.38,
    baseHealth: 3000, baseSpeed: 4, baseArmor: 50, turnSpeed: 50, mass: 3.5,
    turretMountHeight: 0.85,
  },
  mammoth: {
    id: 'mammoth',
    name: 'Mammoth',
    length: 3.0, width: 1.85, height: 0.72, trackWidth: 0.36,
    baseHealth: 2800, baseSpeed: 5, baseArmor: 45, turnSpeed: 55, mass: 3.2,
    turretMountHeight: 0.82,
  },
  crusader: {
    id: 'crusader',
    name: 'Crusader',
    length: 2.5, width: 1.55, height: 0.55, trackWidth: 0.28,
    baseHealth: 1500, baseSpeed: 8, baseArmor: 20, turnSpeed: 90, mass: 1.8,
    turretMountHeight: 0.65,
  },
};

// Original Tanki Online turret specifications (2014-2017 era)
export interface TOTurretSpec {
  id: string;
  name: string;
  // Visual dimensions
  turretBaseRadius: number;
  turretTopRadius: number;
  turretHeight: number;
  barrelLength: number;
  barrelRadius: number;
  barrelCount: number;
  barrelSpacing: number; // for multi-barrel turrets
  // Special visual features
  hasMuzzleBrake: boolean;
  hasCoil: boolean; // railgun style
  hasNozzle: boolean; // flamethrower style
  // Gameplay stats
  baseDamage: number;
  fireRate: number; // shots per second
  reloadTime: number; // ms
  projectileSpeed: number;
  splashRadius: number; // 0 for no splash
  // Effect type
  effectType: 'bullet' | 'explosive' | 'beam' | 'plasma' | 'flame' | 'freeze' | 'ricochet';
  effectColor: string;
}

export const TO_TURRETS: Record<string, TOTurretSpec> = {
  smoky: {
    id: 'smoky',
    name: 'Smoky',
    turretBaseRadius: 0.45, turretTopRadius: 0.35, turretHeight: 0.35,
    barrelLength: 1.8, barrelRadius: 0.1, barrelCount: 1, barrelSpacing: 0,
    hasMuzzleBrake: true, hasCoil: false, hasNozzle: false,
    baseDamage: 100, fireRate: 2, reloadTime: 500, projectileSpeed: 15, splashRadius: 0,
    effectType: 'bullet', effectColor: '#fbbf24',
  },
  twins: {
    id: 'twins',
    name: 'Twins',
    turretBaseRadius: 0.42, turretTopRadius: 0.32, turretHeight: 0.3,
    barrelLength: 1.5, barrelRadius: 0.07, barrelCount: 2, barrelSpacing: 0.2,
    hasMuzzleBrake: false, hasCoil: false, hasNozzle: false,
    baseDamage: 50, fireRate: 6, reloadTime: 150, projectileSpeed: 18, splashRadius: 0,
    effectType: 'bullet', effectColor: '#4ade80',
  },
  ricochet: {
    id: 'ricochet',
    name: 'Ricochet',
    turretBaseRadius: 0.48, turretTopRadius: 0.38, turretHeight: 0.38,
    barrelLength: 1.6, barrelRadius: 0.12, barrelCount: 1, barrelSpacing: 0,
    hasMuzzleBrake: true, hasCoil: false, hasNozzle: false,
    baseDamage: 120, fireRate: 1.5, reloadTime: 650, projectileSpeed: 20, splashRadius: 0,
    effectType: 'ricochet', effectColor: '#00ff00',
  },
  thunder: {
    id: 'thunder',
    name: 'Thunder',
    turretBaseRadius: 0.55, turretTopRadius: 0.45, turretHeight: 0.42,
    barrelLength: 2.0, barrelRadius: 0.16, barrelCount: 1, barrelSpacing: 0,
    hasMuzzleBrake: true, hasCoil: false, hasNozzle: false,
    baseDamage: 250, fireRate: 0.8, reloadTime: 1200, projectileSpeed: 12, splashRadius: 3,
    effectType: 'explosive', effectColor: '#f97316',
  },
  railgun: {
    id: 'railgun',
    name: 'Railgun',
    turretBaseRadius: 0.5, turretTopRadius: 0.4, turretHeight: 0.35,
    barrelLength: 2.8, barrelRadius: 0.08, barrelCount: 1, barrelSpacing: 0,
    hasMuzzleBrake: false, hasCoil: true, hasNozzle: false,
    baseDamage: 400, fireRate: 0.5, reloadTime: 2000, projectileSpeed: 50, splashRadius: 0,
    effectType: 'beam', effectColor: '#3b82f6',
  },
  shaft: {
    id: 'shaft',
    name: 'Shaft',
    turretBaseRadius: 0.42, turretTopRadius: 0.32, turretHeight: 0.32,
    barrelLength: 3.0, barrelRadius: 0.06, barrelCount: 1, barrelSpacing: 0,
    hasMuzzleBrake: false, hasCoil: true, hasNozzle: false,
    baseDamage: 500, fireRate: 0.4, reloadTime: 2500, projectileSpeed: 100, splashRadius: 0,
    effectType: 'beam', effectColor: '#a855f7',
  },
  firebird: {
    id: 'firebird',
    name: 'Firebird',
    turretBaseRadius: 0.5, turretTopRadius: 0.4, turretHeight: 0.38,
    barrelLength: 1.4, barrelRadius: 0.14, barrelCount: 1, barrelSpacing: 0,
    hasMuzzleBrake: false, hasCoil: false, hasNozzle: true,
    baseDamage: 30, fireRate: 10, reloadTime: 100, projectileSpeed: 8, splashRadius: 0,
    effectType: 'flame', effectColor: '#ff4500',
  },
  freeze: {
    id: 'freeze',
    name: 'Freeze',
    turretBaseRadius: 0.5, turretTopRadius: 0.4, turretHeight: 0.38,
    barrelLength: 1.4, barrelRadius: 0.14, barrelCount: 1, barrelSpacing: 0,
    hasMuzzleBrake: false, hasCoil: false, hasNozzle: true,
    baseDamage: 25, fireRate: 10, reloadTime: 100, projectileSpeed: 8, splashRadius: 0,
    effectType: 'freeze', effectColor: '#00bfff',
  },
  isida: {
    id: 'isida',
    name: 'Isida',
    turretBaseRadius: 0.45, turretTopRadius: 0.35, turretHeight: 0.35,
    barrelLength: 1.0, barrelRadius: 0.1, barrelCount: 1, barrelSpacing: 0,
    hasMuzzleBrake: false, hasCoil: false, hasNozzle: true,
    baseDamage: 20, fireRate: 15, reloadTime: 66, projectileSpeed: 0, splashRadius: 0,
    effectType: 'beam', effectColor: '#00ff7f',
  },
  vulcan: {
    id: 'vulcan',
    name: 'Vulcan',
    turretBaseRadius: 0.52, turretTopRadius: 0.42, turretHeight: 0.4,
    barrelLength: 1.8, barrelRadius: 0.05, barrelCount: 3, barrelSpacing: 0.08,
    hasMuzzleBrake: true, hasCoil: false, hasNozzle: false,
    baseDamage: 15, fireRate: 20, reloadTime: 50, projectileSpeed: 25, splashRadius: 0,
    effectType: 'bullet', effectColor: '#ffd700',
  },
  hammer: {
    id: 'hammer',
    name: 'Hammer',
    turretBaseRadius: 0.48, turretTopRadius: 0.38, turretHeight: 0.36,
    barrelLength: 1.2, barrelRadius: 0.18, barrelCount: 1, barrelSpacing: 0,
    hasMuzzleBrake: true, hasCoil: false, hasNozzle: false,
    baseDamage: 200, fireRate: 1, reloadTime: 1000, projectileSpeed: 10, splashRadius: 1.5,
    effectType: 'bullet', effectColor: '#dc2626',
  },
};

// Authentic Tanki Online map definitions (2014-2017 era)
export interface TOMapElement {
  type: 'building' | 'wall' | 'ramp' | 'crate' | 'barrier' | 'platform';
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  rotation?: number; // Y-axis rotation in radians
  material?: 'concrete' | 'metal' | 'wood' | 'brick';
  destructible?: boolean;
}

export interface TOMapDefinition {
  id: string;
  name: string;
  theme: 'summer' | 'winter' | 'space' | 'night';
  // Map dimensions in game units
  width: number;
  height: number;
  // Team spawns
  redSpawns: Array<{ x: number; y: number; rotation: number }>;
  blueSpawns: Array<{ x: number; y: number; rotation: number }>;
  // Flag positions for CTF
  redFlag: { x: number; y: number };
  blueFlag: { x: number; y: number };
  // Static geometry
  elements: TOMapElement[];
  // Ground variations
  groundType: 'grass' | 'sand' | 'snow' | 'metal';
}

// Authentic Silence map layout (2014-2017)
export const MAP_SILENCE: TOMapDefinition = {
  id: 'silence',
  name: 'Silence',
  theme: 'summer',
  width: 160,
  height: 200,
  groundType: 'grass',
  redSpawns: [
    { x: 20, y: 180, rotation: -Math.PI / 2 },
    { x: 30, y: 175, rotation: -Math.PI / 2 },
    { x: 40, y: 180, rotation: -Math.PI / 2 },
  ],
  blueSpawns: [
    { x: 140, y: 20, rotation: Math.PI / 2 },
    { x: 130, y: 25, rotation: Math.PI / 2 },
    { x: 120, y: 20, rotation: Math.PI / 2 },
  ],
  redFlag: { x: 25, y: 185 },
  blueFlag: { x: 135, y: 15 },
  elements: [
    // Red base structures
    { type: 'building', position: { x: 10, y: 3, z: 160 }, size: { width: 15, height: 6, depth: 25 }, material: 'brick' },
    { type: 'building', position: { x: 45, y: 3, z: 160 }, size: { width: 15, height: 6, depth: 25 }, material: 'brick' },
    { type: 'wall', position: { x: 27, y: 2, z: 185 }, size: { width: 20, height: 4, depth: 3 }, material: 'concrete' },
    
    // Blue base structures
    { type: 'building', position: { x: 145, y: 3, z: 40 }, size: { width: 15, height: 6, depth: 25 }, material: 'brick' },
    { type: 'building', position: { x: 110, y: 3, z: 40 }, size: { width: 15, height: 6, depth: 25 }, material: 'brick' },
    { type: 'wall', position: { x: 133, y: 2, z: 15 }, size: { width: 20, height: 4, depth: 3 }, material: 'concrete' },
    
    // Central bridge (elevated)
    { type: 'platform', position: { x: 80, y: 4, z: 100 }, size: { width: 50, height: 1, depth: 20 }, material: 'metal' },
    { type: 'ramp', position: { x: 55, y: 2, z: 100 }, size: { width: 15, height: 4, depth: 18 }, rotation: Math.PI / 2, material: 'metal' },
    { type: 'ramp', position: { x: 105, y: 2, z: 100 }, size: { width: 15, height: 4, depth: 18 }, rotation: -Math.PI / 2, material: 'metal' },
    
    // Side buildings
    { type: 'building', position: { x: 15, y: 4, z: 80 }, size: { width: 20, height: 8, depth: 30 }, material: 'concrete' },
    { type: 'building', position: { x: 145, y: 4, z: 120 }, size: { width: 20, height: 8, depth: 30 }, material: 'concrete' },
    
    // Cover walls mid-map
    { type: 'wall', position: { x: 60, y: 1.5, z: 60 }, size: { width: 4, height: 3, depth: 15 }, material: 'concrete' },
    { type: 'wall', position: { x: 100, y: 1.5, z: 140 }, size: { width: 4, height: 3, depth: 15 }, material: 'concrete' },
    { type: 'wall', position: { x: 80, y: 1.5, z: 50 }, size: { width: 20, height: 3, depth: 4 }, material: 'concrete' },
    { type: 'wall', position: { x: 80, y: 1.5, z: 150 }, size: { width: 20, height: 3, depth: 4 }, material: 'concrete' },
    
    // Crate clusters
    { type: 'crate', position: { x: 40, y: 1, z: 100 }, size: { width: 3, height: 3, depth: 3 }, material: 'wood' },
    { type: 'crate', position: { x: 43, y: 1, z: 103 }, size: { width: 2, height: 2, depth: 2 }, material: 'wood' },
    { type: 'crate', position: { x: 120, y: 1, z: 100 }, size: { width: 3, height: 3, depth: 3 }, material: 'wood' },
    { type: 'crate', position: { x: 117, y: 1, z: 97 }, size: { width: 2, height: 2, depth: 2 }, material: 'wood' },
    
    // Barriers
    { type: 'barrier', position: { x: 50, y: 0.4, z: 130 }, size: { width: 5, height: 0.8, depth: 0.5 }, material: 'concrete' },
    { type: 'barrier', position: { x: 110, y: 0.4, z: 70 }, size: { width: 5, height: 0.8, depth: 0.5 }, material: 'concrete' },
  ],
};

// Authentic Sandbox map layout (2014-2017)
export const MAP_SANDBOX: TOMapDefinition = {
  id: 'sandbox',
  name: 'Sandbox',
  theme: 'summer',
  width: 100,
  height: 100,
  groundType: 'sand',
  redSpawns: [
    { x: 15, y: 50, rotation: 0 },
    { x: 15, y: 40, rotation: 0 },
    { x: 15, y: 60, rotation: 0 },
  ],
  blueSpawns: [
    { x: 85, y: 50, rotation: Math.PI },
    { x: 85, y: 40, rotation: Math.PI },
    { x: 85, y: 60, rotation: Math.PI },
  ],
  redFlag: { x: 10, y: 50 },
  blueFlag: { x: 90, y: 50 },
  elements: [
    // Central elevated platforms
    { type: 'platform', position: { x: 50, y: 2, z: 35 }, size: { width: 25, height: 1, depth: 20 }, material: 'metal' },
    { type: 'platform', position: { x: 50, y: 2, z: 65 }, size: { width: 25, height: 1, depth: 20 }, material: 'metal' },
    
    // Ramps to platforms
    { type: 'ramp', position: { x: 35, y: 1, z: 35 }, size: { width: 8, height: 2, depth: 18 }, rotation: Math.PI / 2, material: 'metal' },
    { type: 'ramp', position: { x: 65, y: 1, z: 35 }, size: { width: 8, height: 2, depth: 18 }, rotation: -Math.PI / 2, material: 'metal' },
    { type: 'ramp', position: { x: 35, y: 1, z: 65 }, size: { width: 8, height: 2, depth: 18 }, rotation: Math.PI / 2, material: 'metal' },
    { type: 'ramp', position: { x: 65, y: 1, z: 65 }, size: { width: 8, height: 2, depth: 18 }, rotation: -Math.PI / 2, material: 'metal' },
    
    // Corner crates for spawn protection
    { type: 'crate', position: { x: 20, y: 1.5, z: 30 }, size: { width: 3, height: 3, depth: 3 }, material: 'wood' },
    { type: 'crate', position: { x: 20, y: 1.5, z: 70 }, size: { width: 3, height: 3, depth: 3 }, material: 'wood' },
    { type: 'crate', position: { x: 80, y: 1.5, z: 30 }, size: { width: 3, height: 3, depth: 3 }, material: 'wood' },
    { type: 'crate', position: { x: 80, y: 1.5, z: 70 }, size: { width: 3, height: 3, depth: 3 }, material: 'wood' },
    
    // Mid barriers
    { type: 'barrier', position: { x: 50, y: 0.4, z: 50 }, size: { width: 6, height: 0.8, depth: 0.5 }, material: 'concrete' },
  ],
};

// Authentic Polygon map layout (2014-2017)
export const MAP_POLYGON: TOMapDefinition = {
  id: 'polygon',
  name: 'Polygon',
  theme: 'summer',
  width: 120,
  height: 120,
  groundType: 'grass',
  redSpawns: [
    { x: 20, y: 60, rotation: 0 },
    { x: 20, y: 50, rotation: 0 },
    { x: 20, y: 70, rotation: 0 },
  ],
  blueSpawns: [
    { x: 100, y: 60, rotation: Math.PI },
    { x: 100, y: 50, rotation: Math.PI },
    { x: 100, y: 70, rotation: Math.PI },
  ],
  redFlag: { x: 15, y: 60 },
  blueFlag: { x: 105, y: 60 },
  elements: [
    // Central pit walls
    { type: 'wall', position: { x: 60, y: 2, z: 45 }, size: { width: 30, height: 4, depth: 3 }, material: 'concrete' },
    { type: 'wall', position: { x: 60, y: 2, z: 75 }, size: { width: 30, height: 4, depth: 3 }, material: 'concrete' },
    { type: 'wall', position: { x: 45, y: 2, z: 60 }, size: { width: 3, height: 4, depth: 30 }, material: 'concrete' },
    { type: 'wall', position: { x: 75, y: 2, z: 60 }, size: { width: 3, height: 4, depth: 30 }, material: 'concrete' },
    
    // Corner buildings (symmetrical)
    { type: 'building', position: { x: 25, y: 3, z: 25 }, size: { width: 12, height: 6, depth: 12 }, material: 'brick' },
    { type: 'building', position: { x: 95, y: 3, z: 25 }, size: { width: 12, height: 6, depth: 12 }, material: 'brick' },
    { type: 'building', position: { x: 25, y: 3, z: 95 }, size: { width: 12, height: 6, depth: 12 }, material: 'brick' },
    { type: 'building', position: { x: 95, y: 3, z: 95 }, size: { width: 12, height: 6, depth: 12 }, material: 'brick' },
    
    // Side cover walls
    { type: 'wall', position: { x: 35, y: 1.5, z: 60 }, size: { width: 4, height: 3, depth: 15 }, material: 'concrete' },
    { type: 'wall', position: { x: 85, y: 1.5, z: 60 }, size: { width: 4, height: 3, depth: 15 }, material: 'concrete' },
  ],
};

// Available maps
export const TO_MAPS: Record<string, TOMapDefinition> = {
  silence: MAP_SILENCE,
  sandbox: MAP_SANDBOX,
  polygon: MAP_POLYGON,
};

// Get random spawn point for a team
export const getRandomSpawn = (mapId: string, team: 'red' | 'blue') => {
  const map = TO_MAPS[mapId] || MAP_SILENCE;
  const spawns = team === 'red' ? map.redSpawns : map.blueSpawns;
  return spawns[Math.floor(Math.random() * spawns.length)];
};
