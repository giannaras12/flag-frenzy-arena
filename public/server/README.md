# Flag Wars - Game Server

This is the authoritative game server for Flag Wars. All game logic, physics, and player data is handled here to prevent cheating.

## Setup

1. Install Node.js (v18 or higher recommended)
2. Navigate to this folder in terminal
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Configuration

Edit `server.js` to change the server port and other settings:

```javascript
const CONFIG = {
  PORT: 3001,              // WebSocket port
  TICK_RATE: 60,           // Game updates per second
  MAP_WIDTH: 1200,         // Map width in pixels
  MAP_HEIGHT: 800,         // Map height in pixels
  FLAG_PICKUP_RADIUS: 50,  // Distance to pick up flag
  FLAG_CAPTURE_RADIUS: 50, // Distance to capture flag
  RESPAWN_TIME: 3000,      // Respawn delay in ms
  MATCH_DURATION: 600,     // Match length in seconds
  SCORE_TO_WIN: 3,         // Captures needed to win
};
```

## Files

- `server.js` - Main server entry point, WebSocket handling
- `physics.js` - Movement and collision detection
- `hulls.js` - Tank hull definitions and stats
- `guns.js` - Weapon definitions and shot effects
- `walls.js` - Map obstacles and destructible walls
- `database.js` - Player data persistence (JSON file)
- `players.json` - Player data storage (auto-created)

## Client Configuration

In the client app, edit `src/config/serverConfig.ts`:

```typescript
export const SERVER_CONFIG = {
  host: 'localhost',  // Server IP address
  port: 3001,         // Server port
  protocol: 'ws',     // Use 'wss' for secure connections
};
```

## Features

- **Server-Authoritative**: All game logic runs on server
- **Anti-Cheat**: Clients can't modify speed, health, damage, etc.
- **Persistent Data**: Player progress saved to JSON file
- **Console Logging**: See all game events in terminal
- **Upgrade System**: M0-M20 upgrades for hulls and guns
- **CTF Gameplay**: Capture the flag game mode

## Console Output

The server logs important events:
- `[JOIN]` - Player connected
- `[LEAVE]` - Player disconnected
- `[SHOOT]` - Player fired weapon
- `[KILL]` - Player eliminated
- `[FLAG]` - Flag picked up/dropped
- `[CAPTURE]` - Flag captured
- `[PURCHASE]` - Item bought
- `[UPGRADE]` - Item upgraded

## Security Notes

- Never share the server files with players
- Player data is stored locally in `players.json`
- All game calculations happen server-side
- Clients only send input commands (move, shoot, etc.)
