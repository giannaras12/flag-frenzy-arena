import { GameState, Player } from '@/lib/gameTypes';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Zap, Flag, LogOut, Timer } from 'lucide-react';

interface GameHUDProps {
  gameState: GameState | null;
  currentPlayer: Player | null;
  onExitBattle: () => void;
}

export const GameHUD = ({ gameState, currentPlayer, onExitBattle }: GameHUDProps) => {
  if (!gameState || !currentPlayer) return null;

  const healthPercent = (currentPlayer.health / currentPlayer.maxHealth) * 100;
  const minutes = Math.floor(gameState.timeRemaining / 60);
  const seconds = gameState.timeRemaining % 60;

  return (
    <>
      {/* Top Bar - Score and Time */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-8">
        <div className="flex items-center gap-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-6 py-3">
          {/* Red Score */}
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            <span className="font-orbitron text-2xl text-destructive">{gameState.redScore}</span>
          </div>
          
          {/* Timer */}
          <div className="flex items-center gap-2 px-4 border-x border-border">
            <Timer className="w-5 h-5 text-gold" />
            <span className="font-orbitron text-xl text-foreground">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
          
          {/* Blue Score */}
          <div className="flex items-center gap-2">
            <span className="font-orbitron text-2xl text-ally">{gameState.blueScore}</span>
            <Flag className="w-5 h-5 text-ally" />
          </div>
        </div>
      </div>

      {/* Bottom Left - Player Stats */}
      <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 min-w-[200px]">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
            currentPlayer.team === 'red' ? 'border-destructive bg-destructive/20' : 'border-ally bg-ally/20'
          }`}>
            <span className="font-orbitron text-sm text-foreground">
              {currentPlayer.username?.charAt(0).toUpperCase() || 'P'}
            </span>
          </div>
          <div>
            <p className="font-orbitron text-foreground">{currentPlayer.username}</p>
            <p className={`text-sm ${currentPlayer.team === 'red' ? 'text-destructive' : 'text-ally'}`}>
              {currentPlayer.team.toUpperCase()} TEAM
            </p>
          </div>
        </div>

        {/* Health Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Health</span>
            </div>
            <span className="font-orbitron text-sm text-foreground">
              {currentPlayer.health}/{currentPlayer.maxHealth}
            </span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                healthPercent > 50 ? 'bg-primary' : healthPercent > 25 ? 'bg-gold' : 'bg-destructive'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* Flag Indicator */}
        {currentPlayer.hasFlag && (
          <div className="mt-3 p-2 bg-gold/20 border border-gold rounded-lg flex items-center gap-2">
            <Flag className="w-5 h-5 text-gold animate-flag-wave" />
            <span className="font-orbitron text-gold text-sm">CARRYING FLAG</span>
          </div>
        )}
      </div>

      {/* Bottom Right - Controls Help */}
      <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p><kbd className="px-2 py-1 bg-secondary rounded text-foreground">WASD</kbd> Move</p>
          <p><kbd className="px-2 py-1 bg-secondary rounded text-foreground">Mouse</kbd> Aim</p>
          <p><kbd className="px-2 py-1 bg-secondary rounded text-foreground">LMB</kbd> Shoot</p>
          <p><kbd className="px-2 py-1 bg-secondary rounded text-foreground">E</kbd> Interact</p>
          <p><kbd className="px-2 py-1 bg-secondary rounded text-foreground">TAB</kbd> Scoreboard</p>
        </div>
      </div>

      {/* Top Right - Exit Button */}
      <div className="absolute top-4 right-4">
        <Button
          variant="danger"
          size="sm"
          onClick={onExitBattle}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Exit Battle
        </Button>
      </div>
    </>
  );
};
