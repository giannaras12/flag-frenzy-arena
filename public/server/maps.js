/**
 * Map Definitions for Flag Wars
 * 
 * Each map has walls, spawn points, flag positions, and visual settings.
 * Edit these to create new maps or modify existing ones.
 */

const MAPS = {
  summer: {
    id: 'summer',
    name: 'Summer Valley',
    description: 'A sunny battlefield with open fields and strategic cover.',
    width: 2400,
    height: 1600,
    
    // Visual theme
    theme: {
      skyColor: '#87CEEB',          // Light blue sky
      sunPosition: { x: 1800, y: 200 },
      sunColor: '#FFD700',
      sunIntensity: 1.2,
      ambientLight: 0.6,
      groundColor: '#228B22',       // Forest green grass
      groundTexture: 'grass',
      fogColor: '#E0F0FF',
      fogDensity: 0.001,
      shadows: true,
      timeOfDay: 'noon',
    },
    
    // Team spawn areas
    spawns: {
      red: [
        { x: 150, y: 600 },
        { x: 150, y: 800 },
        { x: 150, y: 1000 },
        { x: 250, y: 700 },
        { x: 250, y: 900 },
      ],
      blue: [
        { x: 2250, y: 600 },
        { x: 2250, y: 800 },
        { x: 2250, y: 1000 },
        { x: 2150, y: 700 },
        { x: 2150, y: 900 },
      ],
    },
    
    // Flag positions
    flags: {
      red: { x: 120, y: 800 },
      blue: { x: 2280, y: 800 },
    },
    
    // Walls and obstacles
    walls: [
      // Map boundaries (invisible)
      { id: 'bound-top', position: { x: 0, y: 0 }, width: 2400, height: 30, type: 'boundary', visible: false },
      { id: 'bound-bottom', position: { x: 0, y: 1570 }, width: 2400, height: 30, type: 'boundary', visible: false },
      { id: 'bound-left', position: { x: 0, y: 0 }, width: 30, height: 1600, type: 'boundary', visible: false },
      { id: 'bound-right', position: { x: 2370, y: 0 }, width: 30, height: 1600, type: 'boundary', visible: false },
      
      // Center structures - Stone pillars
      { id: 'center-pillar-1', position: { x: 1100, y: 400 }, width: 100, height: 100, type: 'solid', material: 'stone', height3D: 80 },
      { id: 'center-pillar-2', position: { x: 1200, y: 700 }, width: 100, height: 100, type: 'solid', material: 'stone', height3D: 80 },
      { id: 'center-pillar-3', position: { x: 1100, y: 1000 }, width: 100, height: 100, type: 'solid', material: 'stone', height3D: 80 },
      
      // Red base covers - Wooden barriers
      { id: 'red-wall-1', position: { x: 300, y: 500 }, width: 150, height: 30, type: 'solid', material: 'wood', height3D: 40 },
      { id: 'red-wall-2', position: { x: 300, y: 1070 }, width: 150, height: 30, type: 'solid', material: 'wood', height3D: 40 },
      { id: 'red-wall-3', position: { x: 400, y: 750 }, width: 30, height: 200, type: 'solid', material: 'wood', height3D: 40 },
      
      // Blue base covers - Wooden barriers
      { id: 'blue-wall-1', position: { x: 1950, y: 500 }, width: 150, height: 30, type: 'solid', material: 'wood', height3D: 40 },
      { id: 'blue-wall-2', position: { x: 1950, y: 1070 }, width: 150, height: 30, type: 'solid', material: 'wood', height3D: 40 },
      { id: 'blue-wall-3', position: { x: 1970, y: 750 }, width: 30, height: 200, type: 'solid', material: 'wood', height3D: 40 },
      
      // Mid-field destructible barricades
      { id: 'mid-barricade-1', position: { x: 600, y: 300 }, width: 30, height: 200, type: 'destructible', health: 800, maxHealth: 800, material: 'crate', height3D: 50 },
      { id: 'mid-barricade-2', position: { x: 600, y: 1100 }, width: 30, height: 200, type: 'destructible', health: 800, maxHealth: 800, material: 'crate', height3D: 50 },
      { id: 'mid-barricade-3', position: { x: 1770, y: 300 }, width: 30, height: 200, type: 'destructible', health: 800, maxHealth: 800, material: 'crate', height3D: 50 },
      { id: 'mid-barricade-4', position: { x: 1770, y: 1100 }, width: 30, height: 200, type: 'destructible', health: 800, maxHealth: 800, material: 'crate', height3D: 50 },
      
      // Flanking route covers
      { id: 'flank-cover-1', position: { x: 800, y: 650 }, width: 100, height: 30, type: 'solid', material: 'stone', height3D: 60 },
      { id: 'flank-cover-2', position: { x: 800, y: 920 }, width: 100, height: 30, type: 'solid', material: 'stone', height3D: 60 },
      { id: 'flank-cover-3', position: { x: 1500, y: 650 }, width: 100, height: 30, type: 'solid', material: 'stone', height3D: 60 },
      { id: 'flank-cover-4', position: { x: 1500, y: 920 }, width: 100, height: 30, type: 'solid', material: 'stone', height3D: 60 },
      
      // Top and bottom lane obstacles
      { id: 'lane-top-1', position: { x: 500, y: 100 }, width: 200, height: 80, type: 'solid', material: 'rock', height3D: 100 },
      { id: 'lane-top-2', position: { x: 1700, y: 100 }, width: 200, height: 80, type: 'solid', material: 'rock', height3D: 100 },
      { id: 'lane-bot-1', position: { x: 500, y: 1420 }, width: 200, height: 80, type: 'solid', material: 'rock', height3D: 100 },
      { id: 'lane-bot-2', position: { x: 1700, y: 1420 }, width: 200, height: 80, type: 'solid', material: 'rock', height3D: 100 },
    ],
    
    // Decorative elements (non-collidable)
    decorations: [
      { type: 'tree', position: { x: 200, y: 200 }, scale: 1.2 },
      { type: 'tree', position: { x: 250, y: 350 }, scale: 1.0 },
      { type: 'tree', position: { x: 180, y: 1300 }, scale: 1.1 },
      { type: 'tree', position: { x: 2200, y: 200 }, scale: 1.2 },
      { type: 'tree', position: { x: 2150, y: 350 }, scale: 1.0 },
      { type: 'tree', position: { x: 2220, y: 1300 }, scale: 1.1 },
      { type: 'bush', position: { x: 450, y: 450 }, scale: 0.8 },
      { type: 'bush', position: { x: 1950, y: 450 }, scale: 0.8 },
      { type: 'rock', position: { x: 1200, y: 200 }, scale: 0.6 },
      { type: 'rock', position: { x: 1200, y: 1400 }, scale: 0.6 },
      { type: 'flower', position: { x: 600, y: 600 }, scale: 0.5 },
      { type: 'flower', position: { x: 1800, y: 1000 }, scale: 0.5 },
    ],
  },
  
  winter: {
    id: 'winter',
    name: 'Frozen Fortress',
    description: 'A snowy battlefield with ice and reduced visibility.',
    width: 2400,
    height: 1600,
    
    theme: {
      skyColor: '#B0C4DE',
      sunPosition: { x: 1200, y: 300 },
      sunColor: '#F0F8FF',
      sunIntensity: 0.8,
      ambientLight: 0.5,
      groundColor: '#FFFAFA',
      groundTexture: 'snow',
      fogColor: '#E8E8E8',
      fogDensity: 0.003,
      shadows: true,
      timeOfDay: 'afternoon',
      snowfall: true,
    },
    
    spawns: {
      red: [
        { x: 150, y: 600 },
        { x: 150, y: 800 },
        { x: 150, y: 1000 },
      ],
      blue: [
        { x: 2250, y: 600 },
        { x: 2250, y: 800 },
        { x: 2250, y: 1000 },
      ],
    },
    
    flags: {
      red: { x: 120, y: 800 },
      blue: { x: 2280, y: 800 },
    },
    
    walls: [
      // Boundaries
      { id: 'bound-top', position: { x: 0, y: 0 }, width: 2400, height: 30, type: 'boundary', visible: false },
      { id: 'bound-bottom', position: { x: 0, y: 1570 }, width: 2400, height: 30, type: 'boundary', visible: false },
      { id: 'bound-left', position: { x: 0, y: 0 }, width: 30, height: 1600, type: 'boundary', visible: false },
      { id: 'bound-right', position: { x: 2370, y: 0 }, width: 30, height: 1600, type: 'boundary', visible: false },
      
      // Ice walls (slippery)
      { id: 'ice-wall-1', position: { x: 1100, y: 600 }, width: 200, height: 100, type: 'solid', material: 'ice', height3D: 60, slippery: true },
      { id: 'ice-wall-2', position: { x: 1100, y: 900 }, width: 200, height: 100, type: 'solid', material: 'ice', height3D: 60, slippery: true },
    ],
    
    decorations: [
      { type: 'pine_tree', position: { x: 200, y: 200 }, scale: 1.2 },
      { type: 'snowman', position: { x: 1200, y: 800 }, scale: 1.0 },
    ],
  },
  
  desert: {
    id: 'desert',
    name: 'Scorched Sands',
    description: 'A hot desert with sandstorms and ancient ruins.',
    width: 2400,
    height: 1600,
    
    theme: {
      skyColor: '#F4A460',
      sunPosition: { x: 1200, y: 150 },
      sunColor: '#FFD700',
      sunIntensity: 1.5,
      ambientLight: 0.7,
      groundColor: '#EDC9AF',
      groundTexture: 'sand',
      fogColor: '#DEB887',
      fogDensity: 0.002,
      shadows: true,
      timeOfDay: 'noon',
      sandstorm: true,
    },
    
    spawns: {
      red: [
        { x: 150, y: 600 },
        { x: 150, y: 800 },
        { x: 150, y: 1000 },
      ],
      blue: [
        { x: 2250, y: 600 },
        { x: 2250, y: 800 },
        { x: 2250, y: 1000 },
      ],
    },
    
    flags: {
      red: { x: 120, y: 800 },
      blue: { x: 2280, y: 800 },
    },
    
    walls: [
      // Boundaries
      { id: 'bound-top', position: { x: 0, y: 0 }, width: 2400, height: 30, type: 'boundary', visible: false },
      { id: 'bound-bottom', position: { x: 0, y: 1570 }, width: 2400, height: 30, type: 'boundary', visible: false },
      { id: 'bound-left', position: { x: 0, y: 0 }, width: 30, height: 1600, type: 'boundary', visible: false },
      { id: 'bound-right', position: { x: 2370, y: 0 }, width: 30, height: 1600, type: 'boundary', visible: false },
      
      // Ancient ruins
      { id: 'ruin-1', position: { x: 1100, y: 700 }, width: 150, height: 150, type: 'solid', material: 'sandstone', height3D: 100 },
    ],
    
    decorations: [
      { type: 'cactus', position: { x: 500, y: 400 }, scale: 1.0 },
      { type: 'palm_tree', position: { x: 1800, y: 300 }, scale: 1.2 },
    ],
  },
};

/**
 * Get map by ID
 */
function getMap(id) {
  return MAPS[id] || MAPS.summer;
}

/**
 * Get walls for a specific map
 */
function getMapWalls(mapId) {
  const map = getMap(mapId);
  return map.walls.filter(w => w.visible !== false);
}

/**
 * Get random spawn point for a team
 */
function getSpawnPoint(mapId, team) {
  const map = getMap(mapId);
  const spawns = map.spawns[team];
  return spawns[Math.floor(Math.random() * spawns.length)];
}

module.exports = MAPS;
module.exports.getMap = getMap;
module.exports.getMapWalls = getMapWalls;
module.exports.getSpawnPoint = getSpawnPoint;
