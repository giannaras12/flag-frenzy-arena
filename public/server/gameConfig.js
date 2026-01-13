/**
 * Game Configuration for Flag Wars
 * 
 * Edit these values to adjust game balance and settings.
 * Restart the server after making changes.
 */

const GAME_CONFIG = {
  // ==================== SERVER SETTINGS ====================
  server: {
    port: 3001,
    host: '0.0.0.0',
    tickRate: 60,           // Updates per second
    maxPlayers: 32,         // Maximum players per match
  },

  // ==================== MAP SETTINGS ====================
  map: {
    width: 2400,            // Map width in pixels
    height: 1600,           // Map height in pixels
    theme: 'summer',        // Map theme: summer, winter, desert, night
  },

  // ==================== MATCH SETTINGS ====================
  match: {
    duration: 600,          // Match duration in seconds (10 minutes)
    scoreToWin: 5,          // Flag captures needed to win
    respawnTime: 3000,      // Respawn delay in milliseconds
    warmupTime: 10,         // Warmup time in seconds before match starts
  },

  // ==================== FLAG SETTINGS ====================
  flags: {
    pickupRadius: 50,       // How close to be to pick up flag
    captureRadius: 50,      // How close to base to capture
    returnTime: 30000,      // Time for dropped flag to auto-return (ms)
    carrierSpeedPenalty: 0.15, // Speed reduction when carrying flag (15%)
  },

  // ==================== COMBAT SETTINGS ====================
  combat: {
    friendlyFire: false,    // Can team members damage each other
    headshot Multiplier: 1.5, // Critical hit damage multiplier
    minDamage: 5,           // Minimum damage per hit
    armorReduction: 0.5,    // How much armor reduces damage (50%)
  },

  // ==================== XP & REWARDS ====================
  rewards: {
    killXP: 50,             // XP for killing enemy
    assistXP: 25,           // XP for assist
    flagCaptureXP: 200,     // XP for capturing flag
    flagReturnXP: 50,       // XP for returning own flag
    participationXP: 10,    // XP per minute of play
    winBonusXP: 100,        // XP bonus for winning team
    
    killMoney: 100,         // Money for killing enemy
    flagCaptureMoney: 500,  // Money for capturing flag
    winBonusMoney: 250,     // Money bonus for winning team
  },

  // ==================== AI SETTINGS ====================
  ai: {
    enabled: true,          // Allow AI bots
    maxBotsPerTeam: 10,     // Maximum bots per team
    difficulty: 'normal',   // easy, normal, hard
    reactionTime: 300,      // Reaction time in ms (lower = harder)
    accuracy: 0.7,          // Aim accuracy 0-1 (higher = harder)
    aggressiveness: 0.5,    // How likely to push vs defend 0-1
    flagPriority: 0.6,      // How much AI prioritizes flags vs combat
  },

  // ==================== PROJECTILE SETTINGS ====================
  projectiles: {
    maxLifetime: 5000,      // Max time before projectile despawns (ms)
    maxPerPlayer: 10,       // Max active projectiles per player
  },
};

module.exports = GAME_CONFIG;
