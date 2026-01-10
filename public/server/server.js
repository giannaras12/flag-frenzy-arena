/**
 * FLAG WARS - Game Server
 * 
 * This is the authoritative game server that handles all game logic.
 * Run with: node server.js
 * 
 * Configuration: Edit CONFIG below to change port/settings
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// ==================== CONFIGURATION ====================
const CONFIG = {
  PORT: 3001,
  TICK_RATE: 60, // Game updates per second
  MAP_WIDTH: 1200,
  MAP_HEIGHT: 800,
  FLAG_PICKUP_RADIUS: 50,
  FLAG_CAPTURE_RADIUS: 50,
  RESPAWN_TIME: 3000,
  MATCH_DURATION: 600, // seconds
  SCORE_TO_WIN: 3,
};

// ==================== GAME DATA ====================
const HULLS = require('./hulls');
const GUNS = require('./guns');
const WALLS = require('./walls');

// ==================== DATABASE ====================
const Database = require('./database');
const db = new Database();

// ==================== PHYSICS ====================
const Physics = require('./physics');
const physics = new Physics(CONFIG, WALLS);

// ==================== GAME STATE ====================
let gameState = {
  players: new Map(),
  flags: [
    { id: 'red-flag', team: 'red', position: { x: 80, y: 400 }, isAtBase: true, carriedBy: null },
    { id: 'blue-flag', team: 'blue', position: { x: 1120, y: 400 }, isAtBase: true, carriedBy: null },
  ],
  projectiles: [],
  redScore: 0,
  blueScore: 0,
  timeRemaining: CONFIG.MATCH_DURATION,
  isRunning: true,
};

// ==================== WEBSOCKET SERVER ====================
const wss = new WebSocket.Server({ port: CONFIG.PORT });

console.log('═══════════════════════════════════════════════════════════');
console.log('              FLAG WARS - GAME SERVER');
console.log('═══════════════════════════════════════════════════════════');
console.log(`  Server IP:   localhost`);
console.log(`  Server Port: ${CONFIG.PORT}`);
console.log(`  WebSocket:   ws://localhost:${CONFIG.PORT}`);
console.log('═══════════════════════════════════════════════════════════');
console.log('  Waiting for players to connect...');
console.log('');

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleMessage(ws, clientId, message);
    } catch (err) {
      console.error(`[ERROR] Failed to parse message:`, err.message);
    }
  });

  ws.on('close', () => {
    handleDisconnect(clientId);
  });

  ws.on('error', (err) => {
    console.error(`[ERROR] WebSocket error for ${clientId}:`, err.message);
  });
});

// ==================== MESSAGE HANDLERS ====================
function handleMessage(ws, clientId, message) {
  switch (message.type) {
    case 'join':
      handleJoin(ws, clientId, message.username);
      break;
    case 'move':
      handleMove(clientId, message.direction);
      break;
    case 'rotate':
      handleRotate(clientId, message.angle);
      break;
    case 'rotateTurret':
      handleRotateTurret(clientId, message.angle);
      break;
    case 'shoot':
      handleShoot(clientId);
      break;
    case 'interact':
      handleInteract(clientId);
      break;
    case 'getGarage':
      handleGetGarage(ws, clientId);
      break;
    case 'buyHull':
      handleBuyHull(ws, clientId, message.hullId);
      break;
    case 'buyGun':
      handleBuyGun(ws, clientId, message.gunId);
      break;
    case 'upgradeHull':
      handleUpgradeHull(ws, clientId, message.hullId);
      break;
    case 'upgradeGun':
      handleUpgradeGun(ws, clientId, message.gunId);
      break;
    case 'equipHull':
      handleEquipHull(ws, clientId, message.hullId);
      break;
    case 'equipGun':
      handleEquipGun(ws, clientId, message.gunId);
      break;
  }
}

function handleJoin(ws, clientId, username) {
  console.log(`[JOIN] Player "${username}" connected (ID: ${clientId.substring(0, 8)})`);
  
  // Get or create player data from database
  let playerData = db.getPlayer(clientId);
  if (!playerData) {
    playerData = db.createPlayer(clientId, username);
  } else {
    playerData.username = username;
    db.savePlayer(clientId, playerData);
  }

  // Assign team (balance teams)
  const redCount = [...gameState.players.values()].filter(p => p.team === 'red').length;
  const blueCount = [...gameState.players.values()].filter(p => p.team === 'blue').length;
  const team = redCount <= blueCount ? 'red' : 'blue';

  // Get equipped hull and gun
  const hull = HULLS.find(h => h.id === playerData.equippedHull) || HULLS[0];
  const gun = GUNS.find(g => g.id === playerData.equippedGun) || GUNS[0];

  // Calculate upgraded stats
  const hullLevel = playerData.hullUpgrades[hull.id] || 0;
  const maxHealth = Math.floor(hull.baseHealth * (1 + hullLevel * 0.05));

  // Create player object
  const player = {
    id: clientId,
    ws,
    username,
    position: team === 'red' ? { x: 100, y: 400 } : { x: 1100, y: 400 },
    rotation: team === 'red' ? 0 : Math.PI,
    turretRotation: team === 'red' ? 0 : Math.PI,
    health: maxHealth,
    maxHealth,
    team,
    hull,
    gun,
    hasFlag: false,
    isAlive: true,
    lastShot: 0,
  };

  gameState.players.set(clientId, player);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    playerId: clientId,
    playerData,
  }));

  // Broadcast player joined
  broadcast({
    type: 'playerJoined',
    player: sanitizePlayer(player),
  });
}

function handleDisconnect(clientId) {
  const player = gameState.players.get(clientId);
  if (player) {
    console.log(`[LEAVE] Player "${player.username}" disconnected`);
    
    // Drop flag if carrying
    if (player.hasFlag) {
      const flag = gameState.flags.find(f => f.carriedBy === clientId);
      if (flag) {
        flag.carriedBy = null;
        flag.position = { ...player.position };
        flag.isAtBase = false;
        console.log(`[FLAG] ${player.username} dropped the ${flag.team} flag`);
      }
    }

    gameState.players.delete(clientId);
    
    broadcast({
      type: 'playerLeft',
      playerId: clientId,
    });
  }
}

function handleMove(clientId, direction) {
  const player = gameState.players.get(clientId);
  if (!player || !player.isAlive) return;

  const hull = player.hull;
  const hullLevel = db.getPlayer(clientId)?.hullUpgrades[hull.id] || 0;
  const speed = Math.floor(hull.baseSpeed * (1 + hullLevel * 0.05));

  // Calculate new position (server authoritative)
  const newPos = physics.movePlayer(player.position, direction, speed);
  
  // Check wall collisions
  if (!physics.checkWallCollision(newPos, 20)) {
    player.position = newPos;
    
    // Update flag position if carrying
    if (player.hasFlag) {
      const flag = gameState.flags.find(f => f.carriedBy === clientId);
      if (flag) {
        flag.position = { ...newPos };
      }
    }
  }
}

function handleRotate(clientId, angle) {
  const player = gameState.players.get(clientId);
  if (player) {
    player.rotation = angle;
  }
}

function handleRotateTurret(clientId, angle) {
  const player = gameState.players.get(clientId);
  if (player) {
    player.turretRotation = angle;
  }
}

function handleShoot(clientId) {
  const player = gameState.players.get(clientId);
  if (!player || !player.isAlive) return;

  const now = Date.now();
  const gun = player.gun;
  const gunLevel = db.getPlayer(clientId)?.gunUpgrades[gun.id] || 0;
  const reloadTime = Math.max(50, gun.reloadTime - gunLevel * 20);

  if (now - player.lastShot < reloadTime) return;

  player.lastShot = now;

  // Create projectile
  const damage = Math.floor(gun.baseDamage * (1 + gunLevel * 0.05));
  const projectile = {
    id: uuidv4(),
    ownerId: clientId,
    position: { ...player.position },
    velocity: {
      x: Math.cos(player.turretRotation) * gun.projectileSpeed,
      y: Math.sin(player.turretRotation) * gun.projectileSpeed,
    },
    damage,
    effect: gun.shotEffect,
    color: gun.shotColor,
    createdAt: now,
  };

  gameState.projectiles.push(projectile);
  console.log(`[SHOOT] ${player.username} fired ${gun.name}`);
}

function handleInteract(clientId) {
  const player = gameState.players.get(clientId);
  if (!player || !player.isAlive) return;

  // Check if near enemy flag
  const enemyFlag = gameState.flags.find(f => 
    f.team !== player.team && 
    !f.carriedBy &&
    physics.distance(player.position, f.position) < CONFIG.FLAG_PICKUP_RADIUS
  );

  if (enemyFlag && !player.hasFlag) {
    // Pick up enemy flag
    enemyFlag.carriedBy = clientId;
    enemyFlag.isAtBase = false;
    player.hasFlag = true;
    
    console.log(`[FLAG] ${player.username} picked up the ${enemyFlag.team} flag!`);
    
    broadcast({
      type: 'flagPickup',
      playerId: clientId,
      flagTeam: enemyFlag.team,
    });
    return;
  }

  // Check if at own base with enemy flag
  if (player.hasFlag) {
    const ownFlag = gameState.flags.find(f => f.team === player.team);
    if (ownFlag && physics.distance(player.position, ownFlag.position) < CONFIG.FLAG_CAPTURE_RADIUS) {
      // Capture the flag!
      const enemyFlagCarried = gameState.flags.find(f => f.carriedBy === clientId);
      if (enemyFlagCarried) {
        enemyFlagCarried.carriedBy = null;
        enemyFlagCarried.position = enemyFlagCarried.team === 'red' 
          ? { x: 80, y: 400 } 
          : { x: 1120, y: 400 };
        enemyFlagCarried.isAtBase = true;
        player.hasFlag = false;

        // Update score
        if (player.team === 'red') {
          gameState.redScore++;
        } else {
          gameState.blueScore++;
        }

        // Update player stats
        const playerData = db.getPlayer(clientId);
        if (playerData) {
          playerData.stats.flagCaptures++;
          playerData.money += 500; // Reward for capture
          db.savePlayer(clientId, playerData);
        }

        console.log(`[CAPTURE] ${player.username} captured the flag! Score: Red ${gameState.redScore} - Blue ${gameState.blueScore}`);

        broadcast({
          type: 'flagCapture',
          playerId: clientId,
          team: player.team,
        });
      }
    }
  }
}

function handleGetGarage(ws, clientId) {
  const playerData = db.getPlayer(clientId);
  
  ws.send(JSON.stringify({
    type: 'garageData',
    hulls: HULLS,
    guns: GUNS,
    playerData,
  }));
}

function handleBuyHull(ws, clientId, hullId) {
  const playerData = db.getPlayer(clientId);
  const hull = HULLS.find(h => h.id === hullId);
  
  if (!hull) {
    return sendError(ws, 'Hull not found');
  }
  
  if (playerData.ownedHulls.includes(hullId)) {
    return sendError(ws, 'Hull already owned');
  }
  
  if (playerData.money < hull.price) {
    return sendError(ws, 'Not enough money');
  }

  playerData.money -= hull.price;
  playerData.ownedHulls.push(hullId);
  playerData.hullUpgrades[hullId] = 0;
  db.savePlayer(clientId, playerData);

  console.log(`[PURCHASE] ${playerData.username} bought ${hull.name}`);

  ws.send(JSON.stringify({
    type: 'purchaseResult',
    success: true,
    message: `Purchased ${hull.name}!`,
    playerData,
  }));
}

function handleBuyGun(ws, clientId, gunId) {
  const playerData = db.getPlayer(clientId);
  const gun = GUNS.find(g => g.id === gunId);
  
  if (!gun) {
    return sendError(ws, 'Gun not found');
  }
  
  if (playerData.ownedGuns.includes(gunId)) {
    return sendError(ws, 'Gun already owned');
  }
  
  if (playerData.money < gun.price) {
    return sendError(ws, 'Not enough money');
  }

  playerData.money -= gun.price;
  playerData.ownedGuns.push(gunId);
  playerData.gunUpgrades[gunId] = 0;
  db.savePlayer(clientId, playerData);

  console.log(`[PURCHASE] ${playerData.username} bought ${gun.name}`);

  ws.send(JSON.stringify({
    type: 'purchaseResult',
    success: true,
    message: `Purchased ${gun.name}!`,
    playerData,
  }));
}

function handleUpgradeHull(ws, clientId, hullId) {
  const playerData = db.getPlayer(clientId);
  
  if (!playerData.ownedHulls.includes(hullId)) {
    return sendError(ws, 'Hull not owned');
  }

  const currentLevel = playerData.hullUpgrades[hullId] || 0;
  if (currentLevel >= 20) {
    return sendError(ws, 'Hull already at max level');
  }

  const cost = Math.floor(1000 * Math.pow(1.5, currentLevel));
  if (playerData.money < cost) {
    return sendError(ws, 'Not enough money');
  }

  playerData.money -= cost;
  playerData.hullUpgrades[hullId] = currentLevel + 1;
  db.savePlayer(clientId, playerData);

  console.log(`[UPGRADE] ${playerData.username} upgraded ${hullId} to M${currentLevel + 1}`);

  ws.send(JSON.stringify({
    type: 'upgradeResult',
    success: true,
    message: `Upgraded to M${currentLevel + 1}!`,
    playerData,
  }));
}

function handleUpgradeGun(ws, clientId, gunId) {
  const playerData = db.getPlayer(clientId);
  
  if (!playerData.ownedGuns.includes(gunId)) {
    return sendError(ws, 'Gun not owned');
  }

  const currentLevel = playerData.gunUpgrades[gunId] || 0;
  if (currentLevel >= 20) {
    return sendError(ws, 'Gun already at max level');
  }

  const cost = Math.floor(1000 * Math.pow(1.5, currentLevel));
  if (playerData.money < cost) {
    return sendError(ws, 'Not enough money');
  }

  playerData.money -= cost;
  playerData.gunUpgrades[gunId] = currentLevel + 1;
  db.savePlayer(clientId, playerData);

  console.log(`[UPGRADE] ${playerData.username} upgraded ${gunId} to M${currentLevel + 1}`);

  ws.send(JSON.stringify({
    type: 'upgradeResult',
    success: true,
    message: `Upgraded to M${currentLevel + 1}!`,
    playerData,
  }));
}

function handleEquipHull(ws, clientId, hullId) {
  const playerData = db.getPlayer(clientId);
  
  if (!playerData.ownedHulls.includes(hullId)) {
    return sendError(ws, 'Hull not owned');
  }

  playerData.equippedHull = hullId;
  db.savePlayer(clientId, playerData);

  ws.send(JSON.stringify({
    type: 'purchaseResult',
    success: true,
    message: 'Hull equipped!',
    playerData,
  }));
}

function handleEquipGun(ws, clientId, gunId) {
  const playerData = db.getPlayer(clientId);
  
  if (!playerData.ownedGuns.includes(gunId)) {
    return sendError(ws, 'Gun not owned');
  }

  playerData.equippedGun = gunId;
  db.savePlayer(clientId, playerData);

  ws.send(JSON.stringify({
    type: 'purchaseResult',
    success: true,
    message: 'Gun equipped!',
    playerData,
  }));
}

// ==================== UTILITY FUNCTIONS ====================
function sendError(ws, message) {
  ws.send(JSON.stringify({ type: 'error', message }));
}

function sanitizePlayer(player) {
  const { ws, lastShot, ...rest } = player;
  return rest;
}

function broadcast(message) {
  const data = JSON.stringify(message);
  gameState.players.forEach(player => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(data);
    }
  });
}

// ==================== GAME LOOP ====================
function gameLoop() {
  if (!gameState.isRunning) return;

  // Update projectiles
  const now = Date.now();
  gameState.projectiles = gameState.projectiles.filter(proj => {
    // Move projectile
    proj.position.x += proj.velocity.x;
    proj.position.y += proj.velocity.y;

    // Check bounds
    if (proj.position.x < 0 || proj.position.x > CONFIG.MAP_WIDTH ||
        proj.position.y < 0 || proj.position.y > CONFIG.MAP_HEIGHT) {
      return false;
    }

    // Check wall collision
    if (physics.checkWallCollision(proj.position, 5)) {
      return false;
    }

    // Check player collision
    for (const [playerId, player] of gameState.players) {
      if (playerId === proj.ownerId) continue;
      if (!player.isAlive) continue;

      if (physics.distance(proj.position, player.position) < 25) {
        // Hit!
        player.health -= proj.damage;
        
        const shooter = gameState.players.get(proj.ownerId);
        
        if (player.health <= 0) {
          player.isAlive = false;
          console.log(`[KILL] ${shooter?.username || 'Unknown'} killed ${player.username}`);
          
          // Update stats
          if (shooter) {
            const shooterData = db.getPlayer(proj.ownerId);
            if (shooterData) {
              shooterData.stats.kills++;
              shooterData.money += 100;
              db.savePlayer(proj.ownerId, shooterData);
            }
          }
          
          const victimData = db.getPlayer(playerId);
          if (victimData) {
            victimData.stats.deaths++;
            db.savePlayer(playerId, victimData);
          }

          // Drop flag if carrying
          if (player.hasFlag) {
            const flag = gameState.flags.find(f => f.carriedBy === playerId);
            if (flag) {
              flag.carriedBy = null;
              flag.position = { ...player.position };
              flag.isAtBase = false;
            }
            player.hasFlag = false;
          }

          // Schedule respawn
          setTimeout(() => {
            const respawnPlayer = gameState.players.get(playerId);
            if (respawnPlayer) {
              respawnPlayer.isAlive = true;
              respawnPlayer.health = respawnPlayer.maxHealth;
              respawnPlayer.position = respawnPlayer.team === 'red' 
                ? { x: 100, y: 400 } 
                : { x: 1100, y: 400 };
            }
          }, CONFIG.RESPAWN_TIME);

          broadcast({
            type: 'playerKilled',
            killerId: proj.ownerId,
            victimId: playerId,
          });
        }
        
        return false;
      }
    }

    // Remove old projectiles
    if (now - proj.createdAt > 5000) {
      return false;
    }

    return true;
  });

  // Broadcast game state
  const stateMessage = {
    type: 'gameState',
    state: {
      players: [...gameState.players.values()].map(sanitizePlayer),
      flags: gameState.flags,
      projectiles: gameState.projectiles,
      walls: WALLS,
      redScore: gameState.redScore,
      blueScore: gameState.blueScore,
      timeRemaining: gameState.timeRemaining,
      isRunning: gameState.isRunning,
    },
  };

  broadcast(stateMessage);
}

// Start game loop
setInterval(gameLoop, 1000 / CONFIG.TICK_RATE);

// Timer countdown
setInterval(() => {
  if (gameState.timeRemaining > 0 && gameState.isRunning) {
    gameState.timeRemaining--;
  }
}, 1000);
