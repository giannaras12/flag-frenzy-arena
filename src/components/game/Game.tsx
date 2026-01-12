import { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './GameCanvas';
import { GameHUD } from './GameHUD';
import { Scoreboard } from './Scoreboard';
import { SoundControls } from './SoundControls';
import { RankUpOverlay } from './RankUpOverlay';
import { XPGainIndicator } from './XPGainIndicator';
import { GameState, Vector2, PlayerData, XPGainEvent, RankUpEvent } from '@/lib/gameTypes';
import { useSound } from '@/contexts/SoundContext';

interface GameProps {
  gameState: GameState | null;
  playerId: string | null;
  playerData: PlayerData | null;
  onMove: (direction: Vector2) => void;
  onRotate: (angle: number) => void;
  onRotateTurret: (angle: number) => void;
  onShoot: () => void;
  onInteract: () => void;
  onExitBattle: () => void;
  lastRankUp: RankUpEvent | null;
  lastXPGain: XPGainEvent | null;
  onClearRankUp: () => void;
  onClearXPGain: () => void;
}

export const Game = ({
  gameState,
  playerId,
  playerData,
  onMove,
  onRotate,
  onRotateTurret,
  onShoot,
  onInteract,
  onExitBattle,
  lastRankUp,
  lastXPGain,
  onClearRankUp,
  onClearXPGain,
}: GameProps) => {
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const prevGameStateRef = useRef<GameState | null>(null);
  
  const { 
    playShoot, 
    playExplosion, 
    playFlagPickup, 
    playFlagCapture, 
    playTankMove, 
    stopTankMove,
    playDeath,
    playHit 
  } = useSound();

  const currentPlayer = gameState?.players.find(p => p.id === playerId) || null;

  // Handle shooting with sound
  const handleShoot = useCallback(() => {
    const gunType = currentPlayer?.gun?.shotEffect || 'normal';
    playShoot(gunType);
    onShoot();
  }, [currentPlayer, onShoot, playShoot]);

  // Handle flag interaction with sound
  const handleInteract = useCallback(() => {
    if (currentPlayer?.hasFlag) {
      playFlagCapture();
    } else {
      playFlagPickup();
    }
    onInteract();
  }, [currentPlayer, onInteract, playFlagCapture, playFlagPickup]);

  // Handle movement with sound
  const handleMove = useCallback((direction: Vector2) => {
    if (!isMoving) {
      setIsMoving(true);
      playTankMove();
    }
    onMove(direction);
  }, [isMoving, onMove, playTankMove]);

  // Stop tank movement sound when not moving
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isMoving) {
      timeout = setTimeout(() => {
        setIsMoving(false);
        stopTankMove();
      }, 100);
    }

    return () => clearTimeout(timeout);
  }, [isMoving, stopTankMove]);

  // Watch for game events (kills, flag events, explosions)
  useEffect(() => {
    if (!gameState || !prevGameStateRef.current) {
      prevGameStateRef.current = gameState;
      return;
    }

    const prev = prevGameStateRef.current;

    // Check for projectile explosions
    const currentProjectileIds = new Set(gameState.projectiles.map(p => p.id));
    
    prev.projectiles.forEach(proj => {
      if (!currentProjectileIds.has(proj.id)) {
        if (proj.effect === 'explosive') {
          playExplosion('large');
        } else if (proj.effect === 'plasma') {
          playExplosion('small');
        }
      }
    });

    // Check for player deaths
    prev.players.forEach(prevPlayer => {
      const currPlayer = gameState.players.find(p => p.id === prevPlayer.id);
      if (currPlayer) {
        if (prevPlayer.isAlive && !currPlayer.isAlive) {
          if (prevPlayer.id === playerId) {
            playDeath();
          } else {
            playExplosion('medium');
          }
        }
        
        if (currPlayer.health < prevPlayer.health && prevPlayer.id === playerId) {
          playHit();
        }
      }
    });

    // Check for score changes (flag captures)
    if (gameState.redScore > prev.redScore || gameState.blueScore > prev.blueScore) {
      playFlagCapture();
    }

    prevGameStateRef.current = gameState;
  }, [gameState, playerId, playExplosion, playDeath, playFlagCapture, playHit]);

  // Stop tank sound on exit
  useEffect(() => {
    return () => {
      stopTankMove();
    };
  }, [stopTankMove]);

  // Handle Tab key for scoreboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setShowScoreboard(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setShowScoreboard(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5" />
      
      {/* Game Canvas Container */}
      <div className="relative">
        <GameCanvas
          gameState={gameState}
          playerId={playerId}
          onMove={handleMove}
          onRotate={onRotate}
          onRotateTurret={onRotateTurret}
          onShoot={handleShoot}
          onInteract={handleInteract}
        />
        
        {/* HUD Overlay */}
        <GameHUD
          gameState={gameState}
          currentPlayer={currentPlayer}
          onExitBattle={onExitBattle}
        />
        
        {/* Sound Controls */}
        <div className="absolute top-4 left-4">
          <SoundControls />
        </div>
      </div>

      {/* Scoreboard Modal */}
      {showScoreboard && (
        <Scoreboard gameState={gameState} playerId={playerId} />
      )}

      {/* Rank Up Overlay */}
      {lastRankUp && (
        <RankUpOverlay 
          oldRank={lastRankUp.oldRank} 
          newRank={lastRankUp.newRank} 
          onComplete={onClearRankUp} 
        />
      )}

      {/* XP Gain Indicator */}
      {lastXPGain && (
        <XPGainIndicator amount={lastXPGain.amount} onComplete={onClearXPGain} />
      )}
    </div>
  );
};
