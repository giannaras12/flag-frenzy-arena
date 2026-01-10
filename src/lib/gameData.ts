import { Hull, Gun, Wall } from './gameTypes';

// Hull definitions
export const HULLS: Hull[] = [
  {
    id: 'wasp',
    name: 'Wasp',
    description: 'Light and fast hull, perfect for flag runners',
    baseHealth: 800,
    baseSpeed: 12,
    baseArmor: 5,
    price: 0, // Starter hull
    upgradeLevel: 0,
    sprite: 'wasp',
    color: '#4ade80',
  },
  {
    id: 'hornet',
    name: 'Hornet',
    description: 'Balanced hull with good speed and armor',
    baseHealth: 1200,
    baseSpeed: 10,
    baseArmor: 15,
    price: 5000,
    upgradeLevel: 0,
    sprite: 'hornet',
    color: '#fbbf24',
  },
  {
    id: 'viking',
    name: 'Viking',
    description: 'Heavy tank with high armor but slower speed',
    baseHealth: 2000,
    baseSpeed: 6,
    baseArmor: 30,
    price: 15000,
    upgradeLevel: 0,
    sprite: 'viking',
    color: '#60a5fa',
  },
  {
    id: 'titan',
    name: 'Titan',
    description: 'The heaviest hull with maximum protection',
    baseHealth: 3000,
    baseSpeed: 4,
    baseArmor: 50,
    price: 50000,
    upgradeLevel: 0,
    sprite: 'titan',
    color: '#a855f7',
  },
  {
    id: 'hunter',
    name: 'Hunter',
    description: 'Stealth hull with moderate stats',
    baseHealth: 1000,
    baseSpeed: 11,
    baseArmor: 10,
    price: 8000,
    upgradeLevel: 0,
    sprite: 'hunter',
    color: '#6b7280',
  },
  {
    id: 'dictator',
    name: 'Dictator',
    description: 'Command hull with balanced offensive capabilities',
    baseHealth: 1800,
    baseSpeed: 7,
    baseArmor: 25,
    price: 25000,
    upgradeLevel: 0,
    sprite: 'dictator',
    color: '#dc2626',
  },
];

// Gun definitions
export const GUNS: Gun[] = [
  {
    id: 'smoky',
    name: 'Smoky',
    description: 'Standard cannon with consistent damage',
    baseDamage: 100,
    fireRate: 2,
    reloadTime: 500,
    projectileSpeed: 15,
    price: 0, // Starter gun
    upgradeLevel: 0,
    shotEffect: 'normal',
    shotColor: '#fbbf24',
    sprite: 'smoky',
  },
  {
    id: 'twins',
    name: 'Twins',
    description: 'Dual barrels for rapid fire',
    baseDamage: 50,
    fireRate: 6,
    reloadTime: 150,
    projectileSpeed: 18,
    price: 3000,
    upgradeLevel: 0,
    shotEffect: 'normal',
    shotColor: '#4ade80',
    sprite: 'twins',
  },
  {
    id: 'thunder',
    name: 'Thunder',
    description: 'Explosive rounds with area damage',
    baseDamage: 250,
    fireRate: 0.8,
    reloadTime: 1200,
    projectileSpeed: 12,
    price: 12000,
    upgradeLevel: 0,
    shotEffect: 'explosive',
    shotColor: '#f97316',
    sprite: 'thunder',
  },
  {
    id: 'railgun',
    name: 'Railgun',
    description: 'High-velocity piercing shots',
    baseDamage: 400,
    fireRate: 0.5,
    reloadTime: 2000,
    projectileSpeed: 30,
    price: 30000,
    upgradeLevel: 0,
    shotEffect: 'railgun',
    shotColor: '#3b82f6',
    sprite: 'railgun',
  },
  {
    id: 'plasma',
    name: 'Plasma',
    description: 'Energy weapon with sustained damage',
    baseDamage: 80,
    fireRate: 4,
    reloadTime: 250,
    projectileSpeed: 20,
    price: 20000,
    upgradeLevel: 0,
    shotEffect: 'plasma',
    shotColor: '#a855f7',
    sprite: 'plasma',
  },
  {
    id: 'laser',
    name: 'Laser',
    description: 'Continuous beam weapon',
    baseDamage: 30,
    fireRate: 10,
    reloadTime: 100,
    projectileSpeed: 50,
    price: 45000,
    upgradeLevel: 0,
    shotEffect: 'laser',
    shotColor: '#ef4444',
    sprite: 'laser',
  },
];

// Map walls for CTF
export const MAP_WALLS: Wall[] = [
  // Outer boundaries
  { id: 'wall-top', position: { x: 0, y: 0 }, width: 1200, height: 20, type: 'solid' },
  { id: 'wall-bottom', position: { x: 0, y: 780 }, width: 1200, height: 20, type: 'solid' },
  { id: 'wall-left', position: { x: 0, y: 0 }, width: 20, height: 800, type: 'solid' },
  { id: 'wall-right', position: { x: 1180, y: 0 }, width: 20, height: 800, type: 'solid' },
  
  // Center obstacles
  { id: 'center-1', position: { x: 550, y: 200 }, width: 100, height: 100, type: 'solid' },
  { id: 'center-2', position: { x: 550, y: 500 }, width: 100, height: 100, type: 'solid' },
  
  // Team base covers
  { id: 'red-cover-1', position: { x: 100, y: 300 }, width: 80, height: 20, type: 'solid' },
  { id: 'red-cover-2', position: { x: 100, y: 480 }, width: 80, height: 20, type: 'solid' },
  { id: 'blue-cover-1', position: { x: 1020, y: 300 }, width: 80, height: 20, type: 'solid' },
  { id: 'blue-cover-2', position: { x: 1020, y: 480 }, width: 80, height: 20, type: 'solid' },
  
  // Mid-field barriers
  { id: 'mid-1', position: { x: 300, y: 150 }, width: 20, height: 150, type: 'destructible', health: 500 },
  { id: 'mid-2', position: { x: 300, y: 500 }, width: 20, height: 150, type: 'destructible', health: 500 },
  { id: 'mid-3', position: { x: 880, y: 150 }, width: 20, height: 150, type: 'destructible', health: 500 },
  { id: 'mid-4', position: { x: 880, y: 500 }, width: 20, height: 150, type: 'destructible', health: 500 },
];

// Upgrade cost multiplier per level
export const UPGRADE_COST_MULTIPLIER = 1.5;
export const BASE_UPGRADE_COST = 1000;

// Calculate upgrade cost
export const getUpgradeCost = (currentLevel: number): number => {
  return Math.floor(BASE_UPGRADE_COST * Math.pow(UPGRADE_COST_MULTIPLIER, currentLevel));
};

// Calculate stats with upgrade level
export const getUpgradedStats = (base: number, upgradeLevel: number): number => {
  return Math.floor(base * (1 + upgradeLevel * 0.05)); // 5% increase per level
};
