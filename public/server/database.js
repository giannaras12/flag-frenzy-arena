/**
 * Database for Flag Wars
 * Handles player data persistence using JSON file storage
 * Now with authentication and rank system
 */

const fs = require('fs');
const path = require('path');
const { hashPassword, verifyPassword, generateSessionToken } = require('./auth');
const { getRankForXP, getNextRank, checkRankUp, XP_REWARDS } = require('./ranks');

const DATA_FILE = path.join(__dirname, 'players.json');
const ACCOUNTS_FILE = path.join(__dirname, 'accounts.json');

class Database {
  constructor() {
    this.players = new Map();
    this.accounts = new Map(); // username -> { passwordHash, odId }
    this.sessions = new Map(); // sessionToken -> odId
    this.load();
  }

  /**
   * Load data from files
   */
  load() {
    try {
      // Load player data
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        for (const [id, player] of Object.entries(data)) {
          this.players.set(id, player);
        }
        console.log(`[DATABASE] Loaded ${this.players.size} players`);
      }
      
      // Load accounts
      if (fs.existsSync(ACCOUNTS_FILE)) {
        const data = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
        for (const [username, account] of Object.entries(data)) {
          this.accounts.set(username.toLowerCase(), account);
        }
        console.log(`[DATABASE] Loaded ${this.accounts.size} accounts`);
      }
    } catch (err) {
      console.error('[DATABASE] Failed to load:', err.message);
    }
  }

  /**
   * Save players to file
   */
  save() {
    try {
      const data = Object.fromEntries(this.players);
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('[DATABASE] Failed to save players:', err.message);
    }
  }

  /**
   * Save accounts to file
   */
  saveAccounts() {
    try {
      const data = Object.fromEntries(this.accounts);
      fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('[DATABASE] Failed to save accounts:', err.message);
    }
  }

  /**
   * Register a new account
   */
  register(username, password) {
    const usernameLower = username.toLowerCase();
    
    if (this.accounts.has(usernameLower)) {
      return { success: false, error: 'Username already taken' };
    }

    const odId = require('crypto').randomUUID();
    const passwordHash = hashPassword(password);
    
    // Create account
    this.accounts.set(usernameLower, {
      passwordHash,
      odId,
      createdAt: Date.now(),
    });
    this.saveAccounts();

    // Create player data
    const playerData = this.createPlayer(odId, username);
    
    // Generate session
    const sessionToken = generateSessionToken();
    this.sessions.set(sessionToken, odId);

    console.log(`[AUTH] New account registered: ${username}`);
    
    return { success: true, sessionToken, odId, playerData };
  }

  /**
   * Login to an account
   */
  login(username, password) {
    const usernameLower = username.toLowerCase();
    const account = this.accounts.get(usernameLower);
    
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    if (!verifyPassword(password, account.passwordHash)) {
      return { success: false, error: 'Invalid password' };
    }

    // Get player data
    const playerData = this.getPlayer(account.odId);
    if (!playerData) {
      return { success: false, error: 'Player data not found' };
    }

    // Update username if changed (case)
    if (playerData.username !== username) {
      playerData.username = username;
      this.savePlayer(account.odId, playerData);
    }

    // Generate session
    const sessionToken = generateSessionToken();
    this.sessions.set(sessionToken, account.odId);

    console.log(`[AUTH] Player logged in: ${username}`);
    
    return { success: true, sessionToken, odId: account.odId, playerData };
  }

  /**
   * Validate session and get player ID
   */
  validateSession(sessionToken) {
    return this.sessions.get(sessionToken) || null;
  }

  /**
   * Logout (invalidate session)
   */
  logout(sessionToken) {
    this.sessions.delete(sessionToken);
  }

  /**
   * Get player data
   */
  getPlayer(id) {
    return this.players.get(id);
  }

  /**
   * Create new player
   */
  createPlayer(id, username) {
    const playerData = {
      id,
      username,
      money: 5000,
      xp: 0,
      ownedHulls: ['wasp'],
      ownedGuns: ['smoky'],
      equippedHull: 'wasp',
      equippedGun: 'smoky',
      hullUpgrades: { wasp: 0 },
      gunUpgrades: { smoky: 0 },
      stats: {
        kills: 0,
        deaths: 0,
        flagCaptures: 0,
        flagReturns: 0,
        damageDealt: 0,
        wins: 0,
        losses: 0,
        gamesPlayed: 0,
      },
      createdAt: Date.now(),
      lastSeen: Date.now(),
    };

    this.players.set(id, playerData);
    this.save();
    
    console.log(`[DATABASE] Created new player: ${username}`);
    return playerData;
  }

  /**
   * Save player data
   */
  savePlayer(id, data) {
    data.lastSeen = Date.now();
    this.players.set(id, data);
    this.save();
  }

  /**
   * Add XP to player and check for rankup
   */
  addXP(id, amount) {
    const player = this.players.get(id);
    if (!player) return null;

    const oldXP = player.xp || 0;
    const newXP = oldXP + amount;
    player.xp = newXP;
    
    this.savePlayer(id, player);

    const rankUpResult = checkRankUp(oldXP, newXP);
    const currentRank = getRankForXP(newXP);
    const nextRankInfo = getNextRank(newXP);

    return {
      oldXP,
      newXP,
      xpGained: amount,
      currentRank,
      nextRankInfo,
      ...rankUpResult,
    };
  }

  /**
   * Award XP for a kill
   */
  awardKillXP(id) {
    return this.addXP(id, XP_REWARDS.kill);
  }

  /**
   * Award XP for flag capture
   */
  awardFlagCaptureXP(id) {
    return this.addXP(id, XP_REWARDS.flagCapture);
  }

  /**
   * Delete player
   */
  deletePlayer(id) {
    this.players.delete(id);
    this.save();
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(sortBy = 'xp', limit = 10) {
    const players = [...this.players.values()];
    
    players.sort((a, b) => {
      switch (sortBy) {
        case 'xp':
          return (b.xp || 0) - (a.xp || 0);
        case 'kills':
          return b.stats.kills - a.stats.kills;
        case 'captures':
          return b.stats.flagCaptures - a.stats.flagCaptures;
        case 'kd':
          const kdA = a.stats.deaths > 0 ? a.stats.kills / a.stats.deaths : a.stats.kills;
          const kdB = b.stats.deaths > 0 ? b.stats.kills / b.stats.deaths : b.stats.kills;
          return kdB - kdA;
        case 'money':
          return b.money - a.money;
        default:
          return 0;
      }
    });

    return players.slice(0, limit).map(p => ({
      username: p.username,
      xp: p.xp || 0,
      rank: getRankForXP(p.xp || 0),
      kills: p.stats.kills,
      deaths: p.stats.deaths,
      flagCaptures: p.stats.flagCaptures,
      money: p.money,
    }));
  }

  /**
   * Add money to player (reward)
   */
  addMoney(id, amount) {
    const player = this.players.get(id);
    if (player) {
      player.money += amount;
      this.savePlayer(id, player);
      return player.money;
    }
    return 0;
  }

  /**
   * Get total players count
   */
  getPlayerCount() {
    return this.players.size;
  }

  /**
   * Get online players (seen in last 5 minutes)
   */
  getOnlineCount() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return [...this.players.values()].filter(p => p.lastSeen > fiveMinutesAgo).length;
  }

  /**
   * Check if username exists
   */
  usernameExists(username) {
    return this.accounts.has(username.toLowerCase());
  }
}

module.exports = Database;
