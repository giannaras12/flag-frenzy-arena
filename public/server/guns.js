/**
 * Gun/Turret Definitions for Flag Wars
 * 
 * All gun stats and properties.
 * Edit these values to adjust weapon balance.
 * 
 * Stats explained:
 * - baseDamage: Damage per hit at M0
 * - fireRate: Shots per second
 * - reloadTime: Time between shots in ms
 * - projectileSpeed: How fast projectiles travel (pixels per frame)
 * - range: Maximum effective range (pixels)
 * - splashRadius: Area damage radius (0 = no splash)
 * - critChance: Chance for critical hit (0-1)
 * - penetration: Armor piercing ability (0-1, higher = ignores more armor)
 */

const GUNS = [
  {
    id: 'smoky',
    name: 'Smoky',
    description: 'Classic balanced gun. Reliable in all situations.',
    baseDamage: 80,
    fireRate: 2,
    reloadTime: 500,
    projectileSpeed: 15,
    range: 600,
    splashRadius: 0,
    explosionRadius: 0,
    critChance: 0.1,
    critMultiplier: 2.0,
    penetration: 0.2,
    price: 0, // Starter gun
    sprite: 'smoky',
    shotEffect: 'normal',
    shotColor: '#facc15',
    muzzleFlash: true,
    tracerEffect: true,
    upgrades: {
      damagePerLevel: 0.05,
      reloadPerLevel: 0.03,
    },
  },
  {
    id: 'thunder',
    name: 'Thunder',
    description: 'Explosive shells deal splash damage. Great for groups.',
    baseDamage: 120,
    fireRate: 0.8,
    reloadTime: 1250,
    projectileSpeed: 12,
    range: 500,
    splashRadius: 60,
    explosionRadius: 60,
    splashFalloff: 0.5,
    critChance: 0.05,
    critMultiplier: 1.5,
    penetration: 0.4,
    price: 8000,
    sprite: 'thunder',
    shotEffect: 'explosive',
    shotColor: '#f97316',
    muzzleFlash: true,
    tracerEffect: true,
    explosionEffect: true,
    upgrades: {
      damagePerLevel: 0.06,
      reloadPerLevel: 0.02,
      splashPerLevel: 0.02,
    },
  },
  {
    id: 'railgun',
    name: 'Railgun',
    description: 'High-velocity piercing round. Penetrates multiple targets.',
    baseDamage: 200,
    fireRate: 0.5,
    reloadTime: 2000,
    projectileSpeed: 50,
    range: 1000,
    splashRadius: 0,
    explosionRadius: 0,
    critChance: 0.15,
    critMultiplier: 2.5,
    penetration: 0.8,
    pierceCount: 3,
    piercing: true,
    pierceDamageFalloff: 0.3,
    price: 20000,
    sprite: 'railgun',
    shotEffect: 'railgun',
    shotColor: '#06b6d4',
    muzzleFlash: true,
    tracerEffect: true,
    chargeTime: 500,
    upgrades: {
      damagePerLevel: 0.07,
      reloadPerLevel: 0.03,
    },
  },
  {
    id: 'ricochet',
    name: 'Ricochet',
    description: 'Bouncing plasma balls. Perfect for tight spaces.',
    baseDamage: 60,
    fireRate: 3,
    reloadTime: 333,
    projectileSpeed: 10,
    range: 800,
    splashRadius: 0,
    explosionRadius: 0,
    critChance: 0.08,
    critMultiplier: 1.5,
    penetration: 0.15,
    bounceCount: 4,
    bounceDamageFalloff: 0.1,
    price: 12000,
    sprite: 'ricochet',
    shotEffect: 'plasma',
    shotColor: '#22c55e',
    muzzleFlash: true,
    tracerEffect: true,
    upgrades: {
      damagePerLevel: 0.05,
      reloadPerLevel: 0.04,
    },
  },
  {
    id: 'twins',
    name: 'Twins',
    description: 'Dual barrels for sustained fire. Never stop shooting.',
    baseDamage: 40,
    fireRate: 6,
    reloadTime: 166,
    projectileSpeed: 18,
    range: 400,
    splashRadius: 0,
    explosionRadius: 0,
    critChance: 0.05,
    critMultiplier: 1.5,
    penetration: 0.1,
    dualBarrel: true,
    price: 6000,
    sprite: 'twins',
    shotEffect: 'normal',
    shotColor: '#3b82f6',
    muzzleFlash: true,
    tracerEffect: true,
    upgrades: {
      damagePerLevel: 0.04,
      reloadPerLevel: 0.05,
    },
  },
  {
    id: 'firebird',
    name: 'Firebird',
    description: 'Flamethrower that applies burning damage over time.',
    baseDamage: 25,
    fireRate: 10,
    reloadTime: 100,
    projectileSpeed: 8,
    range: 250,
    splashRadius: 20,
    explosionRadius: 20,
    critChance: 0,
    critMultiplier: 1.0,
    penetration: 0.05,
    burnDamage: 10,
    burnDuration: 3000,
    burnTickRate: 500,
    price: 15000,
    sprite: 'firebird',
    shotEffect: 'fire',
    shotColor: '#ef4444',
    muzzleFlash: true,
    tracerEffect: false,
    flameEffect: true,
    upgrades: {
      damagePerLevel: 0.04,
      reloadPerLevel: 0.03,
      burnPerLevel: 0.05,
    },
  },
  {
    id: 'freeze',
    name: 'Freeze',
    description: 'Cryo gun that slows enemies. Control the battlefield.',
    baseDamage: 30,
    fireRate: 8,
    reloadTime: 125,
    projectileSpeed: 10,
    range: 300,
    splashRadius: 15,
    explosionRadius: 15,
    critChance: 0,
    critMultiplier: 1.0,
    penetration: 0.1,
    slowAmount: 0.4,
    slowDuration: 2000,
    price: 18000,
    sprite: 'freeze',
    shotEffect: 'ice',
    shotColor: '#67e8f9',
    muzzleFlash: true,
    tracerEffect: false,
    iceEffect: true,
    upgrades: {
      damagePerLevel: 0.04,
      reloadPerLevel: 0.03,
      slowPerLevel: 0.02,
    },
  },
  {
    id: 'shaft',
    name: 'Shaft',
    description: 'Sniper laser. Charge for massive damage at long range.',
    baseDamage: 300,
    fireRate: 0.3,
    reloadTime: 3333,
    projectileSpeed: 100,
    range: 1500,
    splashRadius: 0,
    explosionRadius: 0,
    critChance: 0.25,
    critMultiplier: 3.0,
    penetration: 0.9,
    chargeTime: 1500,
    chargeDamageMultiplier: 2.0,
    scopeZoom: 2.5,
    beam: true,
    price: 45000,
    sprite: 'shaft',
    shotEffect: 'laser',
    shotColor: '#f43f5e',
    muzzleFlash: true,
    tracerEffect: true,
    laserEffect: true,
    upgrades: {
      damagePerLevel: 0.08,
      reloadPerLevel: 0.02,
    },
  },
  {
    id: 'isida',
    name: 'Isida',
    description: 'Energy beam that heals allies or damages enemies.',
    baseDamage: 35,
    healAmount: 50,
    fireRate: 0,
    reloadTime: 0,
    projectileSpeed: 0,
    range: 200,
    splashRadius: 0,
    explosionRadius: 0,
    critChance: 0,
    critMultiplier: 1.0,
    penetration: 0.15,
    beamWeapon: true,
    canHeal: true,
    price: 30000,
    sprite: 'isida',
    shotEffect: 'beam',
    shotColor: '#a855f7',
    muzzleFlash: false,
    tracerEffect: false,
    beamEffect: true,
    upgrades: {
      damagePerLevel: 0.05,
      healPerLevel: 0.06,
    },
  },
  {
    id: 'vulcan',
    name: 'Vulcan',
    description: 'Minigun that spins up for devastating sustained fire.',
    baseDamage: 20,
    fireRate: 15,
    reloadTime: 66,
    projectileSpeed: 20,
    range: 350,
    splashRadius: 0,
    explosionRadius: 0,
    critChance: 0.02,
    critMultiplier: 1.5,
    penetration: 0.2,
    spinUpTime: 1000,
    spinDownTime: 500,
    minFireRate: 3,
    price: 40000,
    sprite: 'vulcan',
    shotEffect: 'normal',
    shotColor: '#fbbf24',
    muzzleFlash: true,
    tracerEffect: true,
    spinEffect: true,
    upgrades: {
      damagePerLevel: 0.04,
      reloadPerLevel: 0.04,
    },
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
 * @param {Object} gun - Base gun object
 * @param {number} upgradeLevel - M level (0-20)
 */
function getUpgradedGunStats(gun, upgradeLevel) {
  const upgrades = gun.upgrades || { damagePerLevel: 0.05, reloadPerLevel: 0.03 };
  
  return {
    ...gun,
    damage: Math.floor(gun.baseDamage * (1 + upgradeLevel * upgrades.damagePerLevel)),
    reloadTime: Math.max(50, gun.reloadTime * (1 - upgradeLevel * upgrades.reloadPerLevel)),
    upgradeLevel,
  };
}

// Shot effect handlers for different weapon types
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
      target.health -= damage;
      return [{ target, damage, pierced: true }];
    },
  },
  plasma: {
    onHit: (target, damage, position, players, explosionRadius) => {
      const affected = [];
      target.health -= damage;
      affected.push({ target, damage });
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
      target.health -= damage;
      return [{ target, damage }];
    },
  },
  fire: {
    onHit: (target, damage, burnDamage, burnDuration) => {
      target.health -= damage;
      return [{ target, damage, burn: { damage: burnDamage, duration: burnDuration } }];
    },
  },
  ice: {
    onHit: (target, damage, slowAmount, slowDuration) => {
      target.health -= damage;
      return [{ target, damage, slow: { amount: slowAmount, duration: slowDuration } }];
    },
  },
  beam: {
    onHit: (target, damage, isAlly, healAmount) => {
      if (isAlly) {
        target.health = Math.min(target.maxHealth, target.health + healAmount);
        return [{ target, heal: healAmount }];
      }
      target.health -= damage;
      return [{ target, damage }];
    },
  },
};

module.exports = GUNS;
module.exports.getGun = getGun;
module.exports.getUpgradedGunStats = getUpgradedGunStats;
module.exports.SHOT_EFFECTS = SHOT_EFFECTS;
