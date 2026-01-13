/**
 * Hull Definitions for Flag Wars
 * 
 * All hull stats and properties.
 * Edit these values to adjust hull balance.
 * 
 * Stats explained:
 * - baseHealth: Starting HP at M0
 * - baseSpeed: Movement speed at M0 (pixels per frame)
 * - baseArmor: Damage reduction percentage at M0
 * - weight: Affects push/collision physics (higher = harder to push)
 * - acceleration: How fast the tank speeds up (higher = snappier)
 * - turnSpeed: Hull rotation speed (radians per frame)
 * - size: Visual and collision size multiplier
 */

const HULLS = [
  {
    id: 'wasp',
    name: 'Wasp',
    description: 'Light and fast hull, perfect for flag runners. Fragile but agile.',
    baseHealth: 800,
    baseSpeed: 12,
    baseArmor: 5,
    weight: 50,
    acceleration: 0.9,
    turnSpeed: 0.12,
    size: 0.8,
    price: 0, // Starter hull
    sprite: 'wasp',
    color: '#4ade80',
    // Upgrade multipliers per level
    upgrades: {
      healthPerLevel: 0.05,    // +5% health per M level
      speedPerLevel: 0.03,     // +3% speed per M level
      armorPerLevel: 0.04,     // +4% armor per M level
    },
  },
  {
    id: 'hornet',
    name: 'Hornet',
    description: 'Balanced hull with good speed and armor. Great all-rounder.',
    baseHealth: 1200,
    baseSpeed: 10,
    baseArmor: 15,
    weight: 75,
    acceleration: 0.7,
    turnSpeed: 0.1,
    size: 0.9,
    price: 5000,
    sprite: 'hornet',
    color: '#fbbf24',
    upgrades: {
      healthPerLevel: 0.05,
      speedPerLevel: 0.03,
      armorPerLevel: 0.04,
    },
  },
  {
    id: 'viking',
    name: 'Viking',
    description: 'Heavy tank with high armor but slower speed. A true frontline fighter.',
    baseHealth: 2000,
    baseSpeed: 6,
    baseArmor: 30,
    weight: 150,
    acceleration: 0.4,
    turnSpeed: 0.07,
    size: 1.1,
    price: 15000,
    sprite: 'viking',
    color: '#60a5fa',
    upgrades: {
      healthPerLevel: 0.06,
      speedPerLevel: 0.02,
      armorPerLevel: 0.05,
    },
  },
  {
    id: 'titan',
    name: 'Titan',
    description: 'The heaviest hull with maximum protection. Nearly unstoppable.',
    baseHealth: 3000,
    baseSpeed: 4,
    baseArmor: 50,
    weight: 250,
    acceleration: 0.3,
    turnSpeed: 0.05,
    size: 1.3,
    price: 50000,
    sprite: 'titan',
    color: '#a855f7',
    upgrades: {
      healthPerLevel: 0.07,
      speedPerLevel: 0.02,
      armorPerLevel: 0.06,
    },
  },
  {
    id: 'hunter',
    name: 'Hunter',
    description: 'Stealth hull with moderate stats. Hard to detect, easy to play.',
    baseHealth: 1000,
    baseSpeed: 11,
    baseArmor: 10,
    weight: 60,
    acceleration: 0.85,
    turnSpeed: 0.11,
    size: 0.85,
    price: 8000,
    sprite: 'hunter',
    color: '#6b7280',
    upgrades: {
      healthPerLevel: 0.05,
      speedPerLevel: 0.04,
      armorPerLevel: 0.03,
    },
  },
  {
    id: 'dictator',
    name: 'Dictator',
    description: 'Command hull with balanced offensive capabilities. Lead your team.',
    baseHealth: 1800,
    baseSpeed: 7,
    baseArmor: 25,
    weight: 120,
    acceleration: 0.5,
    turnSpeed: 0.08,
    size: 1.0,
    price: 25000,
    sprite: 'dictator',
    color: '#dc2626',
    upgrades: {
      healthPerLevel: 0.05,
      speedPerLevel: 0.03,
      armorPerLevel: 0.05,
    },
  },
  {
    id: 'mammoth',
    name: 'Mammoth',
    description: 'Massive super-heavy hull. Maximum firepower platform.',
    baseHealth: 3500,
    baseSpeed: 3,
    baseArmor: 60,
    weight: 300,
    acceleration: 0.2,
    turnSpeed: 0.04,
    size: 1.5,
    price: 100000,
    sprite: 'mammoth',
    color: '#0ea5e9',
    upgrades: {
      healthPerLevel: 0.08,
      speedPerLevel: 0.01,
      armorPerLevel: 0.07,
    },
  },
  {
    id: 'hopper',
    name: 'Hopper',
    description: 'Experimental light hull with jump capability. Hit and run specialist.',
    baseHealth: 600,
    baseSpeed: 14,
    baseArmor: 3,
    weight: 40,
    acceleration: 1.0,
    turnSpeed: 0.15,
    size: 0.7,
    price: 35000,
    sprite: 'hopper',
    color: '#f97316',
    abilities: {
      canJump: true,
      jumpCooldown: 5000,
      jumpDistance: 200,
    },
    upgrades: {
      healthPerLevel: 0.04,
      speedPerLevel: 0.05,
      armorPerLevel: 0.02,
    },
  },
];

/**
 * Get hull by ID
 */
function getHull(id) {
  return HULLS.find(h => h.id === id);
}

/**
 * Calculate upgraded hull stats
 * @param {Object} hull - Base hull object
 * @param {number} upgradeLevel - M level (0-20)
 */
function getUpgradedHullStats(hull, upgradeLevel) {
  const upgrades = hull.upgrades || { healthPerLevel: 0.05, speedPerLevel: 0.03, armorPerLevel: 0.04 };
  
  return {
    ...hull,
    health: Math.floor(hull.baseHealth * (1 + upgradeLevel * upgrades.healthPerLevel)),
    speed: hull.baseSpeed * (1 + upgradeLevel * upgrades.speedPerLevel),
    armor: hull.baseArmor * (1 + upgradeLevel * upgrades.armorPerLevel),
    upgradeLevel,
  };
}

module.exports = HULLS;
module.exports.getHull = getHull;
module.exports.getUpgradedHullStats = getUpgradedHullStats;
