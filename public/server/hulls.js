/**
 * Hull Definitions for Flag Wars
 * All hull stats and properties
 */

const HULLS = [
  {
    id: 'wasp',
    name: 'Wasp',
    description: 'Light and fast hull, perfect for flag runners',
    baseHealth: 800,
    baseSpeed: 12,
    baseArmor: 5,
    price: 0, // Starter hull
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
    sprite: 'dictator',
    color: '#dc2626',
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
 */
function getUpgradedHullStats(hull, upgradeLevel) {
  const multiplier = 1 + upgradeLevel * 0.05; // 5% per level
  return {
    ...hull,
    health: Math.floor(hull.baseHealth * multiplier),
    speed: Math.floor(hull.baseSpeed * multiplier),
    armor: Math.floor(hull.baseArmor * multiplier),
    upgradeLevel,
  };
}

module.exports = HULLS;
module.exports.getHull = getHull;
module.exports.getUpgradedHullStats = getUpgradedHullStats;
