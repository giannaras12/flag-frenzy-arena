/**
 * Gun Definitions for Flag Wars
 * All gun stats, effects, and properties
 */

const GUNS = [
  {
    id: 'smoky',
    name: 'Smoky',
    description: 'Standard cannon with consistent damage',
    baseDamage: 100,
    fireRate: 2, // shots per second
    reloadTime: 500, // ms between shots
    projectileSpeed: 15,
    price: 0, // Starter gun
    shotEffect: 'normal',
    shotColor: '#fbbf24',
    explosionRadius: 0,
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
    shotEffect: 'normal',
    shotColor: '#4ade80',
    explosionRadius: 0,
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
    shotEffect: 'explosive',
    shotColor: '#f97316',
    explosionRadius: 60,
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
    shotEffect: 'railgun',
    shotColor: '#3b82f6',
    explosionRadius: 0,
    piercing: true,
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
    shotEffect: 'plasma',
    shotColor: '#a855f7',
    explosionRadius: 20,
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
    shotEffect: 'laser',
    shotColor: '#ef4444',
    explosionRadius: 0,
    beam: true, // Instant hit
    sprite: 'laser',
  },
];

/**
 * Get gun by ID
 */
function getGun(id) {
  return GUNS.find(g => g.id === id);
}

/**
 * Calculate upgraded gun stats
 */
function getUpgradedGunStats(gun, upgradeLevel) {
  const damageMultiplier = 1 + upgradeLevel * 0.05; // 5% per level
  const reloadReduction = upgradeLevel * 20; // 20ms faster per level
  
  return {
    ...gun,
    damage: Math.floor(gun.baseDamage * damageMultiplier),
    reloadTime: Math.max(50, gun.reloadTime - reloadReduction),
    upgradeLevel,
  };
}

/**
 * Shot effect handlers
 */
const SHOT_EFFECTS = {
  normal: {
    onHit: (target, damage) => {
      target.health -= damage;
      return [{ target, damage }];
    },
  },
  
  explosive: {
    onHit: (target, damage, position, players, explosionRadius) => {
      const affected = [];
      
      for (const [id, player] of players) {
        const dist = Math.sqrt(
          Math.pow(player.position.x - position.x, 2) +
          Math.pow(player.position.y - position.y, 2)
        );
        
        if (dist <= explosionRadius) {
          const falloff = 1 - (dist / explosionRadius);
          const actualDamage = Math.floor(damage * falloff);
          player.health -= actualDamage;
          affected.push({ target: player, damage: actualDamage });
        }
      }
      
      return affected;
    },
  },
  
  railgun: {
    onHit: (target, damage) => {
      // Piercing - continues through target
      target.health -= damage;
      return [{ target, damage, pierced: true }];
    },
  },
  
  plasma: {
    onHit: (target, damage, position, players, explosionRadius) => {
      const affected = [];
      
      // Primary target takes full damage
      target.health -= damage;
      affected.push({ target, damage });
      
      // Small splash to nearby
      for (const [id, player] of players) {
        if (player === target) continue;
        
        const dist = Math.sqrt(
          Math.pow(player.position.x - position.x, 2) +
          Math.pow(player.position.y - position.y, 2)
        );
        
        if (dist <= explosionRadius) {
          const splashDamage = Math.floor(damage * 0.3);
          player.health -= splashDamage;
          affected.push({ target: player, damage: splashDamage });
        }
      }
      
      return affected;
    },
  },
  
  laser: {
    onHit: (target, damage) => {
      // Instant hit, lower damage
      target.health -= damage;
      return [{ target, damage }];
    },
  },
};

module.exports = GUNS;
module.exports.getGun = getGun;
module.exports.getUpgradedGunStats = getUpgradedGunStats;
module.exports.SHOT_EFFECTS = SHOT_EFFECTS;
