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

## Server Output

When the server starts, it will display:
- **Server IP**: Your local network IP (e.g., 192.168.1.100)
- **Port**: 3001 (default)
- **Local URL**: For testing on the same computer
- **Public URL**: For players on your local network

## Accessing from Anywhere

### For Local Network (Same WiFi):
Players on the same network can connect using your local IP (shown when server starts).

### For Internet Access (Worldwide):
1. **Port Forwarding**: Open port 3001 on your router
   - Log into your router (usually 192.168.1.1)
   - Find "Port Forwarding" settings
   - Forward external port 3001 to your computer's IP, port 3001
   
2. **Find your Public IP**: Visit https://whatismyip.com
   
3. **Share with players**: Give them `ws://YOUR_PUBLIC_IP:3001`

4. **Update client config**: In `src/config/serverConfig.ts`:
   ```typescript
   export const SERVER_CONFIG = {
     host: 'YOUR_PUBLIC_IP',  // e.g., '203.45.67.89'
     port: 3001,
     protocol: 'ws',
   };
   ```

## Running the Client

The client is a web application that runs in a browser:

### Option 1: Use Lovable's Preview
1. Open your Lovable project
2. Click the preview URL (shown in the right panel)
3. Share that URL with players

### Option 2: Self-Host
1. Build the client:
   ```bash
   npm run build
   ```
2. Serve the `dist` folder with any web server

### Option 3: Deploy to Hosting
1. Click "Publish" in Lovable
2. Share the published URL with players

## Configuration

Edit `server.js` to change settings:

```javascript
const CONFIG = {
  PORT: 3001,              // Server port
  HOST: '0.0.0.0',         // Listen on all interfaces
  TICK_RATE: 60,           // Updates per second
  MAP_WIDTH: 1200,
  MAP_HEIGHT: 800,
  FLAG_PICKUP_RADIUS: 50,
  FLAG_CAPTURE_RADIUS: 50,
  RESPAWN_TIME: 3000,      // ms
  MATCH_DURATION: 600,     // seconds
  SCORE_TO_WIN: 3,
};
```

## Files

- `server.js` - Main server, WebSocket handling, game loop
- `auth.js` - Password hashing, session management
- `database.js` - Player data persistence
- `ranks.js` - Rank definitions and XP calculations
- `physics.js` - Movement, collision detection
- `hulls.js` - Tank hull definitions
- `guns.js` - Weapon definitions
- `walls.js` - Map obstacles
- `players.json` - Player accounts (auto-created)
- `accounts.json` - Login credentials (auto-created)

## Authentication

Players create accounts with username/password:
- Passwords are hashed with PBKDF2 + salt
- Sessions persist until server restart
- All data is stored locally on the server

## Rank System

29 ranks from Recruit to Legend:
- Earn XP for kills (+10), flag captures (+50), participation
- Ranks unlock automatically when XP threshold is reached
- In-battle rank-up animation when you level up

## Console Output

The server logs all events:
- `[AUTH]` - Login/register
- `[JOIN]` - Player joined battle
- `[LEAVE]` - Player left
- `[KILL]` - Player eliminated
- `[FLAG]` - Flag picked up/dropped
- `[CAPTURE]` - Flag captured
- `[RANK]` - Rank up
- `[PURCHASE]` - Item bought
- `[UPGRADE]` - Item upgraded

## Security Notes

- All game calculations are server-side
- Clients only send input commands
- Passwords are hashed, never stored in plain text
- Player data is stored in JSON files (not a real database)
- For production, consider using a proper database
