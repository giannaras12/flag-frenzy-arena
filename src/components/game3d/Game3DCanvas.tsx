import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Vector3 } from 'three';
import { GameState, Player, Vector2 } from '@/lib/gameTypes';
import { GAME_CONFIG } from '@/config/serverConfig';
import { TankModel } from './TankModel';
import { MapEnvironment } from './MapEnvironment';
import { ProjectileEffect } from './ProjectileEffect';

interface Game3DCanvasProps {
  gameState: GameState | null;
  playerId: string | null;
  onMove: (direction: Vector2) => void;
  onRotate: (angle: number) => void;
  onRotateTurret: (angle: number) => void;
  onShoot: () => void;
  onInteract: () => void;
}

const SCALE = 0.05;
const mapWidth = GAME_CONFIG.mapWidth;
const mapHeight = GAME_CONFIG.mapHeight;

// Convert 2D game position to 3D world position
const gameToWorld = (x: number, y: number): [number, number, number] => {
  return [
    (x - mapWidth / 2) * SCALE,
    0.3,
    (y - mapHeight / 2) * SCALE
  ];
};

// Main game scene component
const GameScene = ({
  gameState,
  playerId,
  onMove,
  onRotate,
  onRotateTurret,
  onShoot,
  onInteract,
}: Game3DCanvasProps) => {
  const { camera } = useThree();
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef({ x: 0, y: 0 });
  const [showInteractPrompt, setShowInteractPrompt] = useState(false);
  
  const currentPlayer = useMemo(() => 
    gameState?.players.find(p => p.id === playerId),
    [gameState, playerId]
  );

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key.toLowerCase() === 'e') {
        onInteract();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInteract]);

  // Mouse handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        onShoot();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onShoot]);

  // Game loop for movement and camera
  useFrame(({ clock, raycaster, camera }) => {
    const keys = keysRef.current;
    
    // Movement
    let dx = 0;
    let dy = 0;
    if (keys.has('w') || keys.has('arrowup')) dy -= 1;
    if (keys.has('s') || keys.has('arrowdown')) dy += 1;
    if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
    if (keys.has('d') || keys.has('arrowright')) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      onMove({ x: dx / length, y: dy / length });
      const angle = Math.atan2(dy, dx);
      onRotate(angle);
    }

    // Camera follow player
    if (currentPlayer) {
      const targetPos = gameToWorld(currentPlayer.position.x, currentPlayer.position.y);
      const cameraOffset = new Vector3(0, 25, 20);
      const targetCameraPos = new Vector3(
        targetPos[0] + cameraOffset.x,
        targetPos[1] + cameraOffset.y,
        targetPos[2] + cameraOffset.z
      );
      
      camera.position.lerp(targetCameraPos, 0.05);
      
      // Calculate turret rotation to aim at mouse position
      // Using raycaster to project mouse to ground plane
      const mouse = mouseRef.current;
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseNDC = {
          x: ((mouse.x - rect.left) / rect.width) * 2 - 1,
          y: -((mouse.y - rect.top) / rect.height) * 2 + 1
        };
        
        raycaster.setFromCamera(mouseNDC as any, camera);
        const groundPlane = { normal: new Vector3(0, 1, 0), constant: 0 };
        const target = new Vector3();
        raycaster.ray.intersectPlane({ normal: groundPlane.normal, constant: 0 } as any, target);
        
        if (target) {
          const playerWorldPos = new Vector3(...gameToWorld(currentPlayer.position.x, currentPlayer.position.y));
          const aimDir = target.sub(playerWorldPos);
          const turretAngle = Math.atan2(aimDir.z, aimDir.x);
          onRotateTurret(turretAngle);
        }
      }
    }
  });

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

  if (!gameState) return null;

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 30, 40]} fov={60} />
      
      {/* Map Environment */}
      <MapEnvironment
        mapWidth={mapWidth}
        mapHeight={mapHeight}
        walls={gameState.walls}
        flags={gameState.flags}
        theme="summer"
      />
      
      {/* Players/Tanks */}
      {gameState.players.map((player) => (
        <TankModel
          key={player.id}
          position={gameToWorld(player.position.x, player.position.y)}
          hullRotation={-player.rotation + Math.PI / 2}
          turretRotation={-player.turretRotation + Math.PI / 2}
          team={player.team}
          hull={player.hull}
          gun={player.gun}
          isCurrentPlayer={player.id === playerId}
          hasFlag={player.hasFlag}
          health={player.health}
          maxHealth={player.maxHealth}
          username={player.username}
        />
      ))}
      
      {/* Projectiles */}
      {gameState.projectiles.map((proj) => (
        <ProjectileEffect
          key={proj.id}
          projectile={proj}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
        />
      ))}
    </>
  );
};

// Main canvas wrapper
export const Game3DCanvas = (props: Game3DCanvasProps) => {
  const currentPlayer = props.gameState?.players.find(p => p.id === props.playerId);
  const showInteractPrompt = useMemo(() => {
    if (!currentPlayer || !props.gameState) return false;
    
    const nearFlag = props.gameState.flags.some(flag => {
      if (flag.carriedBy || !flag.isAtBase) return false;
      if (flag.team === currentPlayer.team) return false;
      const dist = Math.sqrt(
        Math.pow(flag.position.x - currentPlayer.position.x, 2) +
        Math.pow(flag.position.y - currentPlayer.position.y, 2)
      );
      return dist < GAME_CONFIG.flagPickupRadius;
    });

    const nearOwnBase = currentPlayer.hasFlag && props.gameState.flags.some(flag => {
      if (flag.team !== currentPlayer.team) return false;
      const dist = Math.sqrt(
        Math.pow(flag.position.x - currentPlayer.position.x, 2) +
        Math.pow(flag.position.y - currentPlayer.position.y, 2)
      );
      return dist < GAME_CONFIG.flagCaptureRadius;
    });

    return nearFlag || nearOwnBase;
  }, [currentPlayer, props.gameState]);

  return (
    <div className="relative w-full h-full" style={{ cursor: 'crosshair' }}>
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <GameScene {...props} />
      </Canvas>
      
      {/* Interact Prompt Overlay */}
      {showInteractPrompt && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm border-2 border-primary rounded-lg px-6 py-3 animate-pulse pointer-events-none">
          <p className="font-orbitron text-primary text-lg">
            Press E to {currentPlayer?.hasFlag ? 'Capture Flag' : 'Get Flag'}
          </p>
        </div>
      )}
    </div>
  );
};
