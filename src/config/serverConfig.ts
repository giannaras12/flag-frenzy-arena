// Server Configuration
// Change these values to connect to your server

export const SERVER_CONFIG = {
  // The IP address of the server
  host: 'localhost',
  
  // The port the server is running on
  port: 3001,
  
  // WebSocket protocol (ws or wss for secure)
  protocol: 'ws',
  
  // Get full WebSocket URL
  get url() {
    return `${this.protocol}://${this.host}:${this.port}`;
  }
};

// Game settings (synced from server)
export const GAME_CONFIG = {
  // Map dimensions
  mapWidth: 1200,
  mapHeight: 800,
  
  // Flag capture radius
  flagPickupRadius: 50,
  flagCaptureRadius: 50,
  
  // Respawn time in ms
  respawnTime: 3000,
  
  // Match duration in seconds
  matchDuration: 600, // 10 minutes
  
  // Score to win
  scoreToWin: 3,
};
