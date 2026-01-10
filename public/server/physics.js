/**
 * Physics Engine for Flag Wars
 * Handles movement, collision detection, and spatial calculations
 */

class Physics {
  constructor(config, walls) {
    this.config = config;
    this.walls = walls;
  }

  /**
   * Calculate distance between two points
   */
  distance(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  }

  /**
   * Normalize a vector
   */
  normalize(vec) {
    const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: vec.x / length, y: vec.y / length };
  }

  /**
   * Move player with speed and direction
   */
  movePlayer(position, direction, speed) {
    const normalized = this.normalize(direction);
    return {
      x: Math.max(30, Math.min(this.config.MAP_WIDTH - 30, position.x + normalized.x * speed)),
      y: Math.max(30, Math.min(this.config.MAP_HEIGHT - 30, position.y + normalized.y * speed)),
    };
  }

  /**
   * Check if a point collides with any wall
   */
  checkWallCollision(point, radius = 0) {
    for (const wall of this.walls) {
      if (this.pointRectCollision(point, radius, wall)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check point-rectangle collision with radius
   */
  pointRectCollision(point, radius, rect) {
    const closestX = Math.max(rect.position.x, Math.min(point.x, rect.position.x + rect.width));
    const closestY = Math.max(rect.position.y, Math.min(point.y, rect.position.y + rect.height));
    
    const distanceX = point.x - closestX;
    const distanceY = point.y - closestY;
    
    return (distanceX * distanceX + distanceY * distanceY) < (radius * radius);
  }

  /**
   * Check circle-circle collision
   */
  circleCollision(a, radiusA, b, radiusB) {
    return this.distance(a, b) < radiusA + radiusB;
  }

  /**
   * Get angle between two points
   */
  angleBetween(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  /**
   * Move point towards target
   */
  moveTowards(from, to, speed) {
    const angle = this.angleBetween(from, to);
    return {
      x: from.x + Math.cos(angle) * speed,
      y: from.y + Math.sin(angle) * speed,
    };
  }

  /**
   * Check line of sight between two points
   */
  hasLineOfSight(from, to, stepSize = 5) {
    const dist = this.distance(from, to);
    const steps = Math.ceil(dist / stepSize);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      };
      
      if (this.checkWallCollision(point, 2)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Calculate projectile trajectory
   */
  calculateTrajectory(origin, angle, speed) {
    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };
  }

  /**
   * Apply explosion damage in radius
   */
  getPlayersInRadius(players, center, radius) {
    const affected = [];
    
    for (const [id, player] of players) {
      if (this.distance(center, player.position) <= radius) {
        affected.push({
          id,
          player,
          distance: this.distance(center, player.position),
        });
      }
    }
    
    return affected;
  }

  /**
   * Calculate damage falloff based on distance
   */
  calculateDamageFalloff(baseDamage, distance, maxDistance) {
    const falloff = 1 - (distance / maxDistance);
    return Math.max(0, Math.floor(baseDamage * falloff));
  }
}

module.exports = Physics;
