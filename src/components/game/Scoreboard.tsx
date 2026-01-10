import { GameState, Player } from '@/lib/gameTypes';
import { Target, Skull, Flag, Swords } from 'lucide-react';

interface ScoreboardProps {
  gameState: GameState | null;
  playerId: string | null;
}

export const Scoreboard = ({ gameState, playerId }: ScoreboardProps) => {
  if (!gameState) return null;

  const redPlayers = gameState.players.filter(p => p.team === 'red');
  const bluePlayers = gameState.players.filter(p => p.team === 'blue');

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl bg-card border-2 border-border rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-destructive/20 via-muted to-ally/20 p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-destructive font-orbitron text-4xl font-bold">{gameState.redScore}</p>
              <p className="text-muted-foreground uppercase tracking-wider">Red Team</p>
            </div>
            
            <div className="text-center">
              <Swords className="w-12 h-12 text-gold mx-auto mb-2" />
              <p className="font-orbitron text-xl text-foreground">
                {Math.floor(gameState.timeRemaining / 60)}:{(gameState.timeRemaining % 60).toString().padStart(2, '0')}
              </p>
            </div>
            
            <div className="text-center flex-1">
              <p className="text-ally font-orbitron text-4xl font-bold">{gameState.blueScore}</p>
              <p className="text-muted-foreground uppercase tracking-wider">Blue Team</p>
            </div>
          </div>
        </div>

        {/* Teams Table */}
        <div className="grid grid-cols-2 gap-4 p-6">
          {/* Red Team */}
          <div>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-destructive/30">
                    <th className="text-left p-3 font-orbitron text-destructive">Player</th>
                    <th className="text-center p-3"><Target className="w-4 h-4 mx-auto text-destructive" /></th>
                    <th className="text-center p-3"><Skull className="w-4 h-4 mx-auto text-destructive" /></th>
                    <th className="text-center p-3 text-gold">K/D</th>
                    <th className="text-center p-3"><Flag className="w-4 h-4 mx-auto text-destructive" /></th>
                  </tr>
                </thead>
                <tbody>
                  {redPlayers.map(player => (
                    <PlayerRow key={player.id} player={player} isCurrentPlayer={player.id === playerId} />
                  ))}
                  {redPlayers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-muted-foreground">No players</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Blue Team */}
          <div>
            <div className="bg-ally/10 border border-ally/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ally/30">
                    <th className="text-left p-3 font-orbitron text-ally">Player</th>
                    <th className="text-center p-3"><Target className="w-4 h-4 mx-auto text-ally" /></th>
                    <th className="text-center p-3"><Skull className="w-4 h-4 mx-auto text-ally" /></th>
                    <th className="text-center p-3 text-gold">K/D</th>
                    <th className="text-center p-3"><Flag className="w-4 h-4 mx-auto text-ally" /></th>
                  </tr>
                </thead>
                <tbody>
                  {bluePlayers.map(player => (
                    <PlayerRow key={player.id} player={player} isCurrentPlayer={player.id === playerId} />
                  ))}
                  {bluePlayers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-muted-foreground">No players</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center p-4 border-t border-border">
          <p className="text-muted-foreground text-sm">Release TAB to close</p>
        </div>
      </div>
    </div>
  );
};

const PlayerRow = ({ player, isCurrentPlayer }: { player: Player; isCurrentPlayer: boolean }) => {
  // Mock stats - in real implementation these come from server
  const kills = 0;
  const deaths = 0;
  const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
  const flags = 0;

  return (
    <tr className={`border-b border-border/50 last:border-0 ${isCurrentPlayer ? 'bg-primary/10' : ''}`}>
      <td className="p-3">
        <div className="flex items-center gap-2">
          {isCurrentPlayer && <span className="text-gold">★</span>}
          <span className="font-medium text-foreground">{player.username}</span>
          {player.hasFlag && <Flag className="w-4 h-4 text-gold" />}
        </div>
      </td>
      <td className="text-center p-3 text-foreground">{kills}</td>
      <td className="text-center p-3 text-foreground">{deaths}</td>
      <td className="text-center p-3 font-orbitron text-gold">{kd}</td>
      <td className="text-center p-3 text-foreground">{flags}</td>
    </tr>
  );
};
