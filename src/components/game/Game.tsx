import { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './GameCanvas';
import { GameHUD } from './GameHUD';
import { Scoreboard } from './Scoreboard';
import { GameState, Vector2 } from '@/lib/gameTypes';

interface GameProps {
  gameState: GameState | null;
  playerId: string | null;
  onMove: (direction: Vector2) => void;
  onRotate: (angle: number) => void;
  onRotateTurret: (angle: number) => void;
  onShoot: () => void;
  onInteract: () => void;
  onExitBattle: () => void;
}

export const Game = ({
  gameState,
  playerId,
  onMove,
  onRotate,
  onRotateTurret,
  onShoot,
  onInteract,
  onExitBattle,
}: GameProps) => {
  const [showScoreboard, setShowScoreboard] = useState(false);

  const currentPlayer = gameState?.players.find(p => p.id === playerId) || null;

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
          onMove={onMove}
          onRotate={onRotate}
          onRotateTurret={onRotateTurret}
          onShoot={onShoot}
          onInteract={onInteract}
        />
        
        {/* HUD Overlay */}
        <GameHUD
          gameState={gameState}
          currentPlayer={currentPlayer}
          onExitBattle={onExitBattle}
        />
      </div>

      {/* Scoreboard Modal */}
      {showScoreboard && (
        <Scoreboard gameState={gameState} playerId={playerId} />
      )}
    </div>
  );
};
