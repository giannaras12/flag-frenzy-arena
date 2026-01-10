/**
 * Database for Flag Wars
 * Handles player data persistence using JSON file storage
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'players.json');

class Database {
  constructor() {
    this.players = new Map();
    this.load();
  }

  /**
   * Load players from file
   */
  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        for (const [id, player] of Object.entries(data)) {
          this.players.set(id, player);
        }
        console.log(`[DATABASE] Loaded ${this.players.size} players`);
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
      console.error('[DATABASE] Failed to save:', err.message);
    }
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
      money: 5000, // Starting money
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
   * Delete player
   */
  deletePlayer(id) {
    this.players.delete(id);
    this.save();
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(sortBy = 'kills', limit = 10) {
    const players = [...this.players.values()];
    
    players.sort((a, b) => {
      switch (sortBy) {
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
}

module.exports = Database;
