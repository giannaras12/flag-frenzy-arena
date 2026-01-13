/**
 * AI Bot System for Flag Wars
 * Simple AI behavior for bot tanks
 */

const { v4: uuidv4 } = require('uuid');

// Store AI bots separately
const aiBots = new Map();

/**
 * Create an AI bot
 */
function createAIBot(team, gameState, HULLS, GUNS) {
  const id = `ai-${uuidv4().slice(0, 8)}`;
  const hull = HULLS[Math.floor(Math.random() * 3)]; // Random starter hull
  const gun = GUNS[Math.floor(Math.random() * 3)]; // Random starter gun
  
  const bot = {
    id,
    isAI: true,
    username: `Bot-${id.slice(3, 7)}`,
    position: team === 'red' ? { x: 150 + Math.random() * 100, y: 600 + Math.random() * 400 } : { x: 2150 + Math.random() * 100, y: 600 + Math.random() * 400 },
    rotation: team === 'red' ? 0 : Math.PI,
    turretRotation: team === 'red' ? 0 : Math.PI,
    health: hull.baseHealth,
    maxHealth: hull.baseHealth,
    team,
    hull,
    gun,
    hasFlag: false,
    isAlive: true,
    lastShot: 0,
    targetId: null,
    state: 'idle', // idle, attacking, capturing, returning
    stateTimer: 0,
  };
  
  aiBots.set(id, bot);
  return bot;
}

/**
 * Update AI bot behavior
 */
function updateAIBot(bot, gameState, config) {
  if (!bot.isAlive) return;
  
  const now = Date.now();
  
  // Find nearest enemy
  let nearestEnemy = null;
  let nearestDist = Infinity;
  
  for (const player of gameState.players.values()) {
    if (player.team === bot.team || !player.isAlive) continue;
    const dist = distance(bot.position, player.position);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestEnemy = player;
    }
  }
  
  // Simple state machine
  if (nearestEnemy && nearestDist < 400) {
    // Attack mode
    bot.state = 'attacking';
    bot.targetId = nearestEnemy.id;
    
    // Aim at enemy
    const angle = Math.atan2(
      nearestEnemy.position.y - bot.position.y,
      nearestEnemy.position.x - bot.position.x
    );
    bot.turretRotation = angle;
    
    // Shoot if ready
    if (now - bot.lastShot > bot.gun.reloadTime) {
      bot.lastShot = now;
      return { action: 'shoot', bot };
    }
    
    // Move towards or away based on distance
    if (nearestDist > 200) {
      moveTowards(bot, nearestEnemy.position, bot.hull.baseSpeed * 0.5);
    } else if (nearestDist < 100) {
      moveAway(bot, nearestEnemy.position, bot.hull.baseSpeed * 0.5);
    }
  } else {
    // Patrol or capture flag
    bot.state = 'idle';
    
    // Random movement
    if (Math.random() < 0.02) {
      const randomAngle = Math.random() * Math.PI * 2;
      bot.rotation = randomAngle;
    }
    
    // Move forward slowly
    bot.position.x += Math.cos(bot.rotation) * bot.hull.baseSpeed * 0.3;
    bot.position.y += Math.sin(bot.rotation) * bot.hull.baseSpeed * 0.3;
    
    // Keep in bounds
    bot.position.x = Math.max(50, Math.min(2350, bot.position.x));
    bot.position.y = Math.max(50, Math.min(1550, bot.position.y));
  }
  
  return null;
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function moveTowards(bot, target, speed) {
  const angle = Math.atan2(target.y - bot.position.y, target.x - bot.position.x);
  bot.position.x += Math.cos(angle) * speed;
  bot.position.y += Math.sin(angle) * speed;
  bot.rotation = angle;
}

function moveAway(bot, target, speed) {
  const angle = Math.atan2(target.y - bot.position.y, target.x - bot.position.x);
  bot.position.x -= Math.cos(angle) * speed;
  bot.position.y -= Math.sin(angle) * speed;
}

/**
 * Add multiple AI bots to a team
 */
function addAIBots(count, team, gameState, HULLS, GUNS) {
  const bots = [];
  for (let i = 0; i < count; i++) {
    const bot = createAIBot(team, gameState, HULLS, GUNS);
    gameState.players.set(bot.id, bot);
    bots.push(bot);
  }
  return bots;
}

/**
 * Remove all AI bots
 */
function removeAllAIBots(gameState) {
  const removed = [];
  for (const [id, player] of gameState.players) {
    if (player.isAI) {
      gameState.players.delete(id);
      aiBots.delete(id);
      removed.push(id);
    }
  }
  return removed;
}

/**
 * Get all AI bots
 */
function getAIBots() {
  return aiBots;
}

module.exports = {
  createAIBot,
  updateAIBot,
  addAIBots,
  removeAllAIBots,
  getAIBots,
};
