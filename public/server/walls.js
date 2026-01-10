/**
 * Map Walls for Flag Wars CTF
 * Defines all walls and obstacles on the map
 */

const WALLS = [
  // Outer boundaries
  { id: 'wall-top', position: { x: 0, y: 0 }, width: 1200, height: 20, type: 'solid' },
  { id: 'wall-bottom', position: { x: 0, y: 780 }, width: 1200, height: 20, type: 'solid' },
  { id: 'wall-left', position: { x: 0, y: 0 }, width: 20, height: 800, type: 'solid' },
  { id: 'wall-right', position: { x: 1180, y: 0 }, width: 20, height: 800, type: 'solid' },
  
  // Center obstacles
  { id: 'center-1', position: { x: 550, y: 200 }, width: 100, height: 100, type: 'solid' },
  { id: 'center-2', position: { x: 550, y: 500 }, width: 100, height: 100, type: 'solid' },
  
  // Team base covers (red side)
  { id: 'red-cover-1', position: { x: 100, y: 300 }, width: 80, height: 20, type: 'solid' },
  { id: 'red-cover-2', position: { x: 100, y: 480 }, width: 80, height: 20, type: 'solid' },
  
  // Team base covers (blue side)
  { id: 'blue-cover-1', position: { x: 1020, y: 300 }, width: 80, height: 20, type: 'solid' },
  { id: 'blue-cover-2', position: { x: 1020, y: 480 }, width: 80, height: 20, type: 'solid' },
  
  // Mid-field barriers (destructible)
  { id: 'mid-1', position: { x: 300, y: 150 }, width: 20, height: 150, type: 'destructible', health: 500, maxHealth: 500 },
  { id: 'mid-2', position: { x: 300, y: 500 }, width: 20, height: 150, type: 'destructible', health: 500, maxHealth: 500 },
  { id: 'mid-3', position: { x: 880, y: 150 }, width: 20, height: 150, type: 'destructible', health: 500, maxHealth: 500 },
  { id: 'mid-4', position: { x: 880, y: 500 }, width: 20, height: 150, type: 'destructible', health: 500, maxHealth: 500 },
  
  // Additional cover positions
  { id: 'cover-mid-top', position: { x: 580, y: 100 }, width: 40, height: 60, type: 'solid' },
  { id: 'cover-mid-bot', position: { x: 580, y: 640 }, width: 40, height: 60, type: 'solid' },
  
  // Flanking routes
  { id: 'flank-1', position: { x: 400, y: 350 }, width: 60, height: 20, type: 'solid' },
  { id: 'flank-2', position: { x: 400, y: 430 }, width: 60, height: 20, type: 'solid' },
  { id: 'flank-3', position: { x: 740, y: 350 }, width: 60, height: 20, type: 'solid' },
  { id: 'flank-4', position: { x: 740, y: 430 }, width: 60, height: 20, type: 'solid' },
];

/**
 * Get wall by ID
 */
function getWall(id) {
  return WALLS.find(w => w.id === id);
}

/**
 * Damage a destructible wall
 */
function damageWall(wallId, damage) {
  const wall = getWall(wallId);
  if (wall && wall.type === 'destructible') {
    wall.health -= damage;
    if (wall.health <= 0) {
      // Remove wall from array
      const index = WALLS.findIndex(w => w.id === wallId);
      if (index > -1) {
        WALLS.splice(index, 1);
      }
      return true; // Wall destroyed
    }
  }
  return false;
}

/**
 * Reset all walls (for new round)
 */
function resetWalls() {
  for (const wall of WALLS) {
    if (wall.type === 'destructible') {
      wall.health = wall.maxHealth;
    }
  }
}

module.exports = WALLS;
module.exports.getWall = getWall;
module.exports.damageWall = damageWall;
module.exports.resetWalls = resetWalls;
