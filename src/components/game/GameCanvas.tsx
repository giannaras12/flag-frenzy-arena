import { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Player, Flag, Wall, Projectile, Vector2 } from '@/lib/gameTypes';
import { GAME_CONFIG } from '@/config/serverConfig';

interface GameCanvasProps {
  gameState: GameState | null;
  playerId: string | null;
  onMove: (direction: Vector2) => void;
  onRotate: (angle: number) => void;
  onRotateTurret: (angle: number) => void;
  onShoot: () => void;
  onInteract: () => void;
}

export const GameCanvas = ({
  gameState,
  playerId,
  onMove,
  onRotate,
  onRotateTurret,
  onShoot,
  onInteract,
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [mousePos, setMousePos] = useState<Vector2>({ x: 0, y: 0 });
  const [showInteractPrompt, setShowInteractPrompt] = useState(false);
  const animationFrameRef = useRef<number>();

  const currentPlayer = gameState?.players.find(p => p.id === playerId);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
      
      if (e.key.toLowerCase() === 'e') {
        onInteract();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInteract]);

  // Handle mouse input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      setMousePos({
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        onShoot();
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onShoot]);

  // Movement loop
  useEffect(() => {
    const moveLoop = () => {
      let dx = 0;
      let dy = 0;

      if (keys.has('w') || keys.has('arrowup')) dy -= 1;
      if (keys.has('s') || keys.has('arrowdown')) dy += 1;
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
      if (keys.has('d') || keys.has('arrowright')) dx += 1;

      if (dx !== 0 || dy !== 0) {
        // Normalize diagonal movement
        const length = Math.sqrt(dx * dx + dy * dy);
        onMove({ x: dx / length, y: dy / length });
        
        // Update hull rotation based on movement
        const angle = Math.atan2(dy, dx);
        onRotate(angle);
      }

      // Update turret rotation to face mouse
      if (currentPlayer) {
        const turretAngle = Math.atan2(
          mousePos.y - currentPlayer.position.y,
          mousePos.x - currentPlayer.position.x
        );
        onRotateTurret(turretAngle);
      }
    };

    const interval = setInterval(moveLoop, 1000 / 60);
    return () => clearInterval(interval);
  }, [keys, mousePos, currentPlayer, onMove, onRotate, onRotateTurret]);

  // Check for flag proximity
  useEffect(() => {
    if (!currentPlayer || !gameState) {
      setShowInteractPrompt(false);
      return;
    }

    const nearFlag = gameState.flags.some(flag => {
      if (flag.carriedBy || !flag.isAtBase) return false;
      if (flag.team === currentPlayer.team) return false;
      
      const dist = Math.sqrt(
        Math.pow(flag.position.x - currentPlayer.position.x, 2) +
        Math.pow(flag.position.y - currentPlayer.position.y, 2)
      );
      return dist < GAME_CONFIG.flagPickupRadius;
    });

    // Check for own flag capture point when carrying enemy flag
    const nearOwnBase = currentPlayer.hasFlag && gameState.flags.some(flag => {
      if (flag.team !== currentPlayer.team) return false;
      
      const dist = Math.sqrt(
        Math.pow(flag.position.x - currentPlayer.position.x, 2) +
        Math.pow(flag.position.y - currentPlayer.position.y, 2)
      );
      return dist < GAME_CONFIG.flagCaptureRadius;
    });

    setShowInteractPrompt(nearFlag || nearOwnBase);
  }, [currentPlayer, gameState]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0f1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (gameState) {
        // Draw walls
        gameState.walls.forEach(wall => drawWall(ctx, wall));

        // Draw flags
        gameState.flags.forEach(flag => drawFlag(ctx, flag));

        // Draw projectiles
        gameState.projectiles.forEach(proj => drawProjectile(ctx, proj));

        // Draw players
        gameState.players.forEach(player => {
          drawPlayer(ctx, player, player.id === playerId);
        });

        // Draw flag bases
        drawFlagBase(ctx, { x: 80, y: 400 }, 'red');
        drawFlagBase(ctx, { x: 1120, y: 400 }, 'blue');
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, playerId]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.mapWidth}
        height={GAME_CONFIG.mapHeight}
        className="border-2 border-border rounded-lg shadow-2xl"
        style={{ cursor: 'crosshair' }}
      />
      
      {/* Interact Prompt */}
      {showInteractPrompt && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm border-2 border-primary rounded-lg px-6 py-3 animate-pulse">
          <p className="font-orbitron text-primary text-lg">Press E to {currentPlayer?.hasFlag ? 'Capture Flag' : 'Get Flag'}</p>
        </div>
      )}
    </div>
  );
};

// Drawing functions
const drawWall = (ctx: CanvasRenderingContext2D, wall: Wall) => {
  const gradient = ctx.createLinearGradient(
    wall.position.x,
    wall.position.y,
    wall.position.x + wall.width,
    wall.position.y + wall.height
  );
  
  if (wall.type === 'solid') {
    gradient.addColorStop(0, '#374151');
    gradient.addColorStop(1, '#1f2937');
  } else {
    gradient.addColorStop(0, '#854d0e');
    gradient.addColorStop(1, '#713f12');
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(wall.position.x, wall.position.y, wall.width, wall.height);
  
  ctx.strokeStyle = wall.type === 'solid' ? '#4b5563' : '#a16207';
  ctx.lineWidth = 2;
  ctx.strokeRect(wall.position.x, wall.position.y, wall.width, wall.height);
};

const drawFlag = (ctx: CanvasRenderingContext2D, flag: Flag) => {
  if (flag.carriedBy) return; // Don't draw if being carried

  const color = flag.team === 'red' ? '#ef4444' : '#3b82f6';
  const glowColor = flag.team === 'red' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)';

  // Glow effect
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 15;

  // Flag pole
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(flag.position.x - 2, flag.position.y - 40, 4, 50);

  // Flag cloth
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(flag.position.x + 2, flag.position.y - 40);
  ctx.lineTo(flag.position.x + 30, flag.position.y - 30);
  ctx.lineTo(flag.position.x + 2, flag.position.y - 20);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
};

const drawFlagBase = (ctx: CanvasRenderingContext2D, position: Vector2, team: 'red' | 'blue') => {
  const color = team === 'red' ? '#ef4444' : '#3b82f6';
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 5]);
  ctx.beginPath();
  ctx.arc(position.x, position.y, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawProjectile = (ctx: CanvasRenderingContext2D, projectile: Projectile) => {
  ctx.shadowColor = projectile.color;
  ctx.shadowBlur = 10;
  
  ctx.fillStyle = projectile.color;
  ctx.beginPath();
  ctx.arc(projectile.position.x, projectile.position.y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
};

const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player, isCurrentPlayer: boolean) => {
  const { position, rotation, turretRotation, team, health, maxHealth, hasFlag } = player;
  
  const teamColor = team === 'red' ? '#ef4444' : '#3b82f6';
  const glowColor = team === 'red' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)';

  ctx.save();
  ctx.translate(position.x, position.y);

  // Glow for current player
  if (isCurrentPlayer) {
    ctx.shadowColor = teamColor;
    ctx.shadowBlur = 20;
  }

  // Hull
  ctx.rotate(rotation);
  ctx.fillStyle = teamColor;
  ctx.fillRect(-20, -15, 40, 30);
  
  // Tracks
  ctx.fillStyle = '#374151';
  ctx.fillRect(-22, -18, 5, 36);
  ctx.fillRect(17, -18, 5, 36);
  
  ctx.rotate(-rotation);

  // Turret
  ctx.rotate(turretRotation);
  ctx.fillStyle = isCurrentPlayer ? '#22c55e' : teamColor;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Barrel
  ctx.fillRect(10, -3, 25, 6);
  ctx.rotate(-turretRotation);

  ctx.shadowBlur = 0;

  // Health bar
  const healthPercent = health / maxHealth;
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(-25, -35, 50, 6);
  ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
  ctx.fillRect(-25, -35, 50 * healthPercent, 6);

  // Flag indicator
  if (hasFlag) {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(0, -45);
    ctx.lineTo(20, -35);
    ctx.lineTo(0, -25);
    ctx.closePath();
    ctx.fill();
  }

  // Username
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px Orbitron';
  ctx.textAlign = 'center';
  ctx.fillText(player.username || 'Player', 0, 45);

  ctx.restore();
};
