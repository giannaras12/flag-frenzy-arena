/**
 * FLAG WARS - Game Server
 * 
 * This is the authoritative game server that handles all game logic.
 * Run with: node server.js
 * 
 * Configuration: Edit CONFIG below to change port/settings
 */

const WebSocket = require('ws');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { validateUsername, validatePassword } = require('./auth');
const { getRankForXP, getNextRank, XP_REWARDS } = require('./ranks');

// ==================== CONFIGURATION ====================
const CONFIG = {
  PORT: 3001,
  HOST: '0.0.0.0', // Listen on all network interfaces for global access
  TICK_RATE: 60,
  MAP_WIDTH: 1200,
  MAP_HEIGHT: 800,
  FLAG_PICKUP_RADIUS: 50,
  FLAG_CAPTURE_RADIUS: 50,
  RESPAWN_TIME: 3000,
  MATCH_DURATION: 600,
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

// ==================== ACTIVE SESSIONS ====================
const activeSessions = new Map(); // odId -> { ws, sessionToken, battleStats }

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

// ==================== GET SERVER IP ====================
function getServerIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const serverIP = getServerIP();

// ==================== WEBSOCKET SERVER ====================
const wss = new WebSocket.Server({ 
  port: CONFIG.PORT,
  host: CONFIG.HOST,
});

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('              FLAG WARS - GAME SERVER');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log(`  🌐 Server IP:      ${serverIP}`);
console.log(`  🔌 Port:           ${CONFIG.PORT}`);
console.log(`  🔗 Local URL:      ws://localhost:${CONFIG.PORT}`);
console.log(`  🌍 Public URL:     ws://${serverIP}:${CONFIG.PORT}`);
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  📋 INSTRUCTIONS FOR CLIENTS:');
console.log('');
console.log('  1. Open the game in a web browser');
console.log('  2. The client is at: https://lovable.dev/projects/YOUR_PROJECT_ID');
console.log(`  3. Configure the client to connect to: ${serverIP}:${CONFIG.PORT}`);
console.log('');
console.log('  Note: Make sure port 3001 is open in your firewall!');
console.log('  For internet access, set up port forwarding on your router.');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('  Waiting for players to connect...');
console.log('');

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`[CONNECT] New connection from ${clientIP}`);
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleMessage(ws, message);
    } catch (err) {
      console.error(`[ERROR] Failed to parse message:`, err.message);
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });

  ws.on('error', (err) => {
    console.error(`[ERROR] WebSocket error:`, err.message);
  });
});

// ==================== MESSAGE HANDLERS ====================
function handleMessage(ws, message) {
  switch (message.type) {
    case 'register':
      handleRegister(ws, message.username, message.password);
      break;
    case 'login':
      handleLogin(ws, message.username, message.password);
      break;
    case 'joinBattle':
      handleJoinBattle(ws, message.sessionToken);
      break;
    case 'move':
      handleMove(ws, message.direction);
      break;
    case 'rotate':
      handleRotate(ws, message.angle);
      break;
    case 'rotateTurret':
      handleRotateTurret(ws, message.angle);
      break;
    case 'shoot':
      handleShoot(ws);
      break;
    case 'interact':
      handleInteract(ws);
      break;
    case 'getGarage':
      handleGetGarage(ws, message.sessionToken);
      break;
    case 'buyHull':
      handleBuyHull(ws, message.sessionToken, message.hullId);
      break;
    case 'buyGun':
      handleBuyGun(ws, message.sessionToken, message.gunId);
      break;
    case 'upgradeHull':
      handleUpgradeHull(ws, message.sessionToken, message.hullId);
      break;
    case 'upgradeGun':
      handleUpgradeGun(ws, message.sessionToken, message.gunId);
      break;
    case 'equipHull':
      handleEquipHull(ws, message.sessionToken, message.hullId);
      break;
    case 'equipGun':
      handleEquipGun(ws, message.sessionToken, message.gunId);
      break;
    case 'leaveBattle':
      handleLeaveBattle(ws);
      break;
  }
}

function handleRegister(ws, username, password) {
  // Validate inputs
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return sendError(ws, usernameValidation.error);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return sendError(ws, passwordValidation.error);
  }

  // Try to register
  const result = db.register(username, password);
  
  if (!result.success) {
    return sendError(ws, result.error);
  }

  // Store session
  ws.sessionToken = result.sessionToken;
  ws.odId = result.odId;

  // Add rank info to player data
  const rankInfo = getRankForXP(result.playerData.xp || 0);
  const nextRankInfo = getNextRank(result.playerData.xp || 0);

  ws.send(JSON.stringify({
    type: 'authSuccess',
    sessionToken: result.sessionToken,
    playerData: {
      ...result.playerData,
      rank: rankInfo,
      nextRank: nextRankInfo,
    },
  }));
}

function handleLogin(ws, username, password) {
  // Validate inputs
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return sendError(ws, usernameValidation.error);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return sendError(ws, passwordValidation.error);
  }

  // Try to login
  const result = db.login(username, password);
  
  if (!result.success) {
    return sendError(ws, result.error);
  }

  // Store session
  ws.sessionToken = result.sessionToken;
  ws.odId = result.odId;

  // Add rank info to player data
  const rankInfo = getRankForXP(result.playerData.xp || 0);
  const nextRankInfo = getNextRank(result.playerData.xp || 0);

  console.log(`[AUTH] ${username} logged in (Rank: ${rankInfo.name})`);

  ws.send(JSON.stringify({
    type: 'authSuccess',
    sessionToken: result.sessionToken,
    playerData: {
      ...result.playerData,
      rank: rankInfo,
      nextRank: nextRankInfo,
    },
  }));
}

function handleJoinBattle(ws, sessionToken) {
  const odId = db.validateSession(sessionToken);
  if (!odId) {
    return sendError(ws, 'Invalid session. Please login again.');
  }

  const playerData = db.getPlayer(odId);
  if (!playerData) {
    return sendError(ws, 'Player data not found');
  }

  console.log(`[JOIN] Player "${playerData.username}" joining battle`);

  // Remove from previous battle if any
  if (gameState.players.has(odId)) {
    gameState.players.delete(odId);
  }

  // Assign team
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
    id: odId,
    ws,
    username: playerData.username,
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
    xp: playerData.xp || 0,
    rank: getRankForXP(playerData.xp || 0),
    battleStats: { kills: 0, deaths: 0, flagCaptures: 0, damageDealt: 0 },
    battleStartTime: Date.now(),
  };

  gameState.players.set(odId, player);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'battleJoined',
    playerId: odId,
    team,
    playerData: {
      ...playerData,
      rank: player.rank,
      nextRank: getNextRank(playerData.xp || 0),
    },
  }));

  // Broadcast player joined
  broadcast({
    type: 'playerJoined',
    player: sanitizePlayer(player),
  });
}

function handleDisconnect(ws) {
  // Find player by websocket
  let disconnectedPlayer = null;
  let disconnectedId = null;
  
  for (const [id, player] of gameState.players) {
    if (player.ws === ws) {
      disconnectedPlayer = player;
      disconnectedId = id;
      break;
    }
  }

  if (disconnectedPlayer) {
    console.log(`[LEAVE] Player "${disconnectedPlayer.username}" disconnected`);
    
    // Award participation XP
    const battleDuration = (Date.now() - disconnectedPlayer.battleStartTime) / 60000; // minutes
    const participationXP = Math.floor(battleDuration * XP_REWARDS.participation);
    if (participationXP > 0) {
      db.addXP(disconnectedId, participationXP);
    }
    
    // Drop flag if carrying
    if (disconnectedPlayer.hasFlag) {
      const flag = gameState.flags.find(f => f.carriedBy === disconnectedId);
      if (flag) {
        flag.carriedBy = null;
        flag.position = { ...disconnectedPlayer.position };
        flag.isAtBase = false;
        console.log(`[FLAG] ${disconnectedPlayer.username} dropped the ${flag.team} flag`);
      }
    }

    gameState.players.delete(disconnectedId);
    
    broadcast({
      type: 'playerLeft',
      playerId: disconnectedId,
    });
  }
}

function handleLeaveBattle(ws) {
  handleDisconnect(ws);
}

function getPlayerFromWs(ws) {
  for (const [id, player] of gameState.players) {
    if (player.ws === ws) {
      return { id, player };
    }
  }
  return null;
}

function handleMove(ws, direction) {
  const result = getPlayerFromWs(ws);
  if (!result || !result.player.isAlive) return;

  const { id: clientId, player } = result;
  const hull = player.hull;
  const playerData = db.getPlayer(clientId);
  const hullLevel = playerData?.hullUpgrades[hull.id] || 0;
  const speed = Math.floor(hull.baseSpeed * (1 + hullLevel * 0.05));

  const newPos = physics.movePlayer(player.position, direction, speed);
  
  if (!physics.checkWallCollision(newPos, 20)) {
    player.position = newPos;
    
    if (player.hasFlag) {
      const flag = gameState.flags.find(f => f.carriedBy === clientId);
      if (flag) {
        flag.position = { ...newPos };
      }
    }
  }
}

function handleRotate(ws, angle) {
  const result = getPlayerFromWs(ws);
  if (result) {
    result.player.rotation = angle;
  }
}

function handleRotateTurret(ws, angle) {
  const result = getPlayerFromWs(ws);
  if (result) {
    result.player.turretRotation = angle;
  }
}

function handleShoot(ws) {
  const result = getPlayerFromWs(ws);
  if (!result || !result.player.isAlive) return;

  const { id: clientId, player } = result;
  const now = Date.now();
  const gun = player.gun;
  const playerData = db.getPlayer(clientId);
  const gunLevel = playerData?.gunUpgrades[gun.id] || 0;
  const reloadTime = Math.max(50, gun.reloadTime - gunLevel * 20);

  if (now - player.lastShot < reloadTime) return;

  player.lastShot = now;

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
}

function handleInteract(ws) {
  const result = getPlayerFromWs(ws);
  if (!result || !result.player.isAlive) return;

  const { id: clientId, player } = result;

  // Check if near enemy flag
  const enemyFlag = gameState.flags.find(f => 
    f.team !== player.team && 
    !f.carriedBy &&
    physics.distance(player.position, f.position) < CONFIG.FLAG_PICKUP_RADIUS
  );

  if (enemyFlag && !player.hasFlag) {
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
      const enemyFlagCarried = gameState.flags.find(f => f.carriedBy === clientId);
      if (enemyFlagCarried) {
        enemyFlagCarried.carriedBy = null;
        enemyFlagCarried.position = enemyFlagCarried.team === 'red' 
          ? { x: 80, y: 400 } 
          : { x: 1120, y: 400 };
        enemyFlagCarried.isAtBase = true;
        player.hasFlag = false;

        if (player.team === 'red') {
          gameState.redScore++;
        } else {
          gameState.blueScore++;
        }

        // Update stats and award XP
        const playerData = db.getPlayer(clientId);
        if (playerData) {
          playerData.stats.flagCaptures++;
          playerData.money += 500;
          db.savePlayer(clientId, playerData);
        }
        
        player.battleStats.flagCaptures++;
        
        // Award XP for flag capture
        const xpResult = db.awardFlagCaptureXP(clientId);
        if (xpResult && xpResult.rankedUp) {
          // Send rankup notification
          player.ws.send(JSON.stringify({
            type: 'rankUp',
            oldRank: xpResult.oldRank,
            newRank: xpResult.newRank,
            newXP: xpResult.newXP,
          }));
          player.rank = xpResult.newRank;
          console.log(`[RANK] ${player.username} ranked up to ${xpResult.newRank.name}!`);
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

function handleGetGarage(ws, sessionToken) {
  const odId = db.validateSession(sessionToken);
  if (!odId) {
    return sendError(ws, 'Invalid session');
  }

  const playerData = db.getPlayer(odId);
  const rankInfo = getRankForXP(playerData.xp || 0);
  const nextRankInfo = getNextRank(playerData.xp || 0);
  
  ws.send(JSON.stringify({
    type: 'garageData',
    hulls: HULLS,
    guns: GUNS,
    playerData: {
      ...playerData,
      rank: rankInfo,
      nextRank: nextRankInfo,
    },
  }));
}

function handleBuyHull(ws, sessionToken, hullId) {
  const odId = db.validateSession(sessionToken);
  if (!odId) return sendError(ws, 'Invalid session');

  const playerData = db.getPlayer(odId);
  const hull = HULLS.find(h => h.id === hullId);
  
  if (!hull) return sendError(ws, 'Hull not found');
  if (playerData.ownedHulls.includes(hullId)) return sendError(ws, 'Hull already owned');
  if (playerData.money < hull.price) return sendError(ws, 'Not enough money');

  playerData.money -= hull.price;
  playerData.ownedHulls.push(hullId);
  playerData.hullUpgrades[hullId] = 0;
  db.savePlayer(odId, playerData);

  console.log(`[PURCHASE] ${playerData.username} bought ${hull.name}`);

  const rankInfo = getRankForXP(playerData.xp || 0);
  const nextRankInfo = getNextRank(playerData.xp || 0);

  ws.send(JSON.stringify({
    type: 'purchaseResult',
    success: true,
    message: `Purchased ${hull.name}!`,
    playerData: { ...playerData, rank: rankInfo, nextRank: nextRankInfo },
  }));
}

function handleBuyGun(ws, sessionToken, gunId) {
  const odId = db.validateSession(sessionToken);
  if (!odId) return sendError(ws, 'Invalid session');

  const playerData = db.getPlayer(odId);
  const gun = GUNS.find(g => g.id === gunId);
  
  if (!gun) return sendError(ws, 'Gun not found');
  if (playerData.ownedGuns.includes(gunId)) return sendError(ws, 'Gun already owned');
  if (playerData.money < gun.price) return sendError(ws, 'Not enough money');

  playerData.money -= gun.price;
  playerData.ownedGuns.push(gunId);
  playerData.gunUpgrades[gunId] = 0;
  db.savePlayer(odId, playerData);

  console.log(`[PURCHASE] ${playerData.username} bought ${gun.name}`);

  const rankInfo = getRankForXP(playerData.xp || 0);
  const nextRankInfo = getNextRank(playerData.xp || 0);

  ws.send(JSON.stringify({
    type: 'purchaseResult',
    success: true,
    message: `Purchased ${gun.name}!`,
    playerData: { ...playerData, rank: rankInfo, nextRank: nextRankInfo },
  }));
}

function handleUpgradeHull(ws, sessionToken, hullId) {
  const odId = db.validateSession(sessionToken);
  if (!odId) return sendError(ws, 'Invalid session');

  const playerData = db.getPlayer(odId);
  
  if (!playerData.ownedHulls.includes(hullId)) return sendError(ws, 'Hull not owned');

  const currentLevel = playerData.hullUpgrades[hullId] || 0;
  if (currentLevel >= 20) return sendError(ws, 'Hull already at max level');

  const cost = Math.floor(1000 * Math.pow(1.5, currentLevel));
  if (playerData.money < cost) return sendError(ws, 'Not enough money');

  playerData.money -= cost;
  playerData.hullUpgrades[hullId] = currentLevel + 1;
  db.savePlayer(odId, playerData);

  console.log(`[UPGRADE] ${playerData.username} upgraded ${hullId} to M${currentLevel + 1}`);

  const rankInfo = getRankForXP(playerData.xp || 0);
  const nextRankInfo = getNextRank(playerData.xp || 0);

  ws.send(JSON.stringify({
    type: 'upgradeResult',
    success: true,
    message: `Upgraded to M${currentLevel + 1}!`,
    playerData: { ...playerData, rank: rankInfo, nextRank: nextRankInfo },
  }));
}

function handleUpgradeGun(ws, sessionToken, gunId) {
  const odId = db.validateSession(sessionToken);
  if (!odId) return sendError(ws, 'Invalid session');

  const playerData = db.getPlayer(odId);
  
  if (!playerData.ownedGuns.includes(gunId)) return sendError(ws, 'Gun not owned');

  const currentLevel = playerData.gunUpgrades[gunId] || 0;
  if (currentLevel >= 20) return sendError(ws, 'Gun already at max level');

  const cost = Math.floor(1000 * Math.pow(1.5, currentLevel));
  if (playerData.money < cost) return sendError(ws, 'Not enough money');

  playerData.money -= cost;
  playerData.gunUpgrades[gunId] = currentLevel + 1;
  db.savePlayer(odId, playerData);

  console.log(`[UPGRADE] ${playerData.username} upgraded ${gunId} to M${currentLevel + 1}`);

  const rankInfo = getRankForXP(playerData.xp || 0);
  const nextRankInfo = getNextRank(playerData.xp || 0);

  ws.send(JSON.stringify({
    type: 'upgradeResult',
    success: true,
    message: `Upgraded to M${currentLevel + 1}!`,
    playerData: { ...playerData, rank: rankInfo, nextRank: nextRankInfo },
  }));
}

function handleEquipHull(ws, sessionToken, hullId) {
  const odId = db.validateSession(sessionToken);
  if (!odId) return sendError(ws, 'Invalid session');

  const playerData = db.getPlayer(odId);
  
  if (!playerData.ownedHulls.includes(hullId)) return sendError(ws, 'Hull not owned');

  playerData.equippedHull = hullId;
  db.savePlayer(odId, playerData);

  const rankInfo = getRankForXP(playerData.xp || 0);
  const nextRankInfo = getNextRank(playerData.xp || 0);

  ws.send(JSON.stringify({
    type: 'purchaseResult',
    success: true,
    message: 'Hull equipped!',
    playerData: { ...playerData, rank: rankInfo, nextRank: nextRankInfo },
  }));
}

function handleEquipGun(ws, sessionToken, gunId) {
  const odId = db.validateSession(sessionToken);
  if (!odId) return sendError(ws, 'Invalid session');

  const playerData = db.getPlayer(odId);
  
  if (!playerData.ownedGuns.includes(gunId)) return sendError(ws, 'Gun not owned');

  playerData.equippedGun = gunId;
  db.savePlayer(odId, playerData);

  const rankInfo = getRankForXP(playerData.xp || 0);
  const nextRankInfo = getNextRank(playerData.xp || 0);

  ws.send(JSON.stringify({
    type: 'purchaseResult',
    success: true,
    message: 'Gun equipped!',
    playerData: { ...playerData, rank: rankInfo, nextRank: nextRankInfo },
  }));
}

// ==================== UTILITY FUNCTIONS ====================
function sendError(ws, message) {
  ws.send(JSON.stringify({ type: 'error', message }));
}

function sanitizePlayer(player) {
  const { ws, lastShot, battleStartTime, battleStats, ...rest } = player;
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

  const now = Date.now();
  gameState.projectiles = gameState.projectiles.filter(proj => {
    proj.position.x += proj.velocity.x;
    proj.position.y += proj.velocity.y;

    if (proj.position.x < 0 || proj.position.x > CONFIG.MAP_WIDTH ||
        proj.position.y < 0 || proj.position.y > CONFIG.MAP_HEIGHT) {
      return false;
    }

    if (physics.checkWallCollision(proj.position, 5)) {
      return false;
    }

    for (const [playerId, player] of gameState.players) {
      if (playerId === proj.ownerId) continue;
      if (!player.isAlive) continue;

      if (physics.distance(proj.position, player.position) < 25) {
        player.health -= proj.damage;
        
        const shooter = gameState.players.get(proj.ownerId);
        if (shooter) {
          shooter.battleStats.damageDealt += proj.damage;
        }
        
        if (player.health <= 0) {
          player.isAlive = false;
          console.log(`[KILL] ${shooter?.username || 'Unknown'} killed ${player.username}`);
          
          if (shooter) {
            const shooterData = db.getPlayer(proj.ownerId);
            if (shooterData) {
              shooterData.stats.kills++;
              shooterData.money += 100;
              db.savePlayer(proj.ownerId, shooterData);
            }
            shooter.battleStats.kills++;
            
            // Award XP for kill
            const xpResult = db.awardKillXP(proj.ownerId);
            if (xpResult && xpResult.rankedUp) {
              shooter.ws.send(JSON.stringify({
                type: 'rankUp',
                oldRank: xpResult.oldRank,
                newRank: xpResult.newRank,
                newXP: xpResult.newXP,
              }));
              shooter.rank = xpResult.newRank;
              console.log(`[RANK] ${shooter.username} ranked up to ${xpResult.newRank.name}!`);
            } else if (xpResult) {
              // Send XP gain notification
              shooter.ws.send(JSON.stringify({
                type: 'xpGain',
                amount: xpResult.xpGained,
                newXP: xpResult.newXP,
                currentRank: xpResult.currentRank,
                nextRank: xpResult.nextRankInfo,
              }));
            }
          }
          
          const victimData = db.getPlayer(playerId);
          if (victimData) {
            victimData.stats.deaths++;
            db.savePlayer(playerId, victimData);
          }
          player.battleStats.deaths++;

          if (player.hasFlag) {
            const flag = gameState.flags.find(f => f.carriedBy === playerId);
            if (flag) {
              flag.carriedBy = null;
              flag.position = { ...player.position };
              flag.isAtBase = false;
            }
            player.hasFlag = false;
          }

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

    if (now - proj.createdAt > 5000) {
      return false;
    }

    return true;
  });

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

setInterval(gameLoop, 1000 / CONFIG.TICK_RATE);

setInterval(() => {
  if (gameState.timeRemaining > 0 && gameState.isRunning) {
    gameState.timeRemaining--;
  }
}, 1000);
