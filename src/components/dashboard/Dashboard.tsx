import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayerData, Rank } from '@/lib/gameTypes';
import { Swords, Warehouse, User, Coins, Target, Skull, Flag, LogIn, UserPlus, Star, ChevronRight } from 'lucide-react';

interface DashboardProps {
  playerData: PlayerData | null;
  onEnterBattle: () => void;
  onOpenGarage: () => void;
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string) => void;
  onConnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const Dashboard = ({
  playerData,
  onEnterBattle,
  onOpenGarage,
  onLogin,
  onRegister,
  onConnect,
  isConnected,
  isConnecting,
  isAuthenticated,
  error,
}: DashboardProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = () => {
    if (username.trim() && password.trim()) {
      if (isRegisterMode) {
        onRegister(username.trim(), password.trim());
      } else {
        onLogin(username.trim(), password.trim());
      }
    }
  };

  const kd = playerData
    ? playerData.stats.deaths > 0
      ? (playerData.stats.kills / playerData.stats.deaths).toFixed(2)
      : playerData.stats.kills.toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5" />
      <div className="absolute inset-0 scanline pointer-events-none" />
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="font-orbitron text-6xl md:text-8xl font-black text-glow-primary text-primary mb-4">
            FLAG WARS
          </h1>
          <p className="text-muted-foreground text-xl font-rajdhani tracking-widest uppercase">
            Capture the Flag • Tank Battle Arena
          </p>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          {!isConnected ? (
            /* Connect to Server */
            <div className="w-full max-w-md">
              <div className="bg-card/80 backdrop-blur-sm border-2 border-border rounded-xl p-8 shadow-2xl">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <Swords className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h2 className="font-orbitron text-2xl text-center mb-6 text-foreground">
                  CONNECT TO SERVER
                </h2>
                
                {error && (
                  <div className="bg-destructive/20 border border-destructive rounded-lg px-4 py-2 mb-4 text-destructive text-sm">
                    {error}
                  </div>
                )}
                
                <Button
                  variant="battle"
                  size="xl"
                  className="w-full"
                  onClick={onConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'CONNECTING...' : 'CONNECT'}
                </Button>
              </div>
            </div>
          ) : !isAuthenticated ? (
            /* Login/Register Form */
            <div className="w-full max-w-md">
              <div className="bg-card/80 backdrop-blur-sm border-2 border-border rounded-xl p-8 shadow-2xl">
                <div className="flex items-center justify-center mb-6">
                  {isRegisterMode ? (
                    <UserPlus className="w-12 h-12 text-primary" />
                  ) : (
                    <LogIn className="w-12 h-12 text-primary" />
                  )}
                </div>
                <h2 className="font-orbitron text-2xl text-center mb-6 text-foreground">
                  {isRegisterMode ? 'CREATE ACCOUNT' : 'LOGIN'}
                </h2>
                
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-secondary/50 border-2 border-border rounded-lg px-4 py-3 text-lg font-rajdhani text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all mb-4"
                  maxLength={20}
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Password"
                  className="w-full bg-secondary/50 border-2 border-border rounded-lg px-4 py-3 text-lg font-rajdhani text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all mb-4"
                />
                
                {error && (
                  <div className="bg-destructive/20 border border-destructive rounded-lg px-4 py-2 mb-4 text-destructive text-sm">
                    {error}
                  </div>
                )}
                
                <Button
                  variant="battle"
                  size="xl"
                  className="w-full mb-4"
                  onClick={handleSubmit}
                  disabled={!username.trim() || !password.trim()}
                >
                  {isRegisterMode ? 'CREATE ACCOUNT' : 'LOGIN'}
                </Button>

                <button
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="w-full text-center text-muted-foreground hover:text-primary transition-colors"
                >
                  {isRegisterMode ? 'Already have an account? Login' : "Don't have an account? Register"}
                </button>
              </div>
            </div>
          ) : (
            /* Main Dashboard */
            <>
              {/* Player Stats Bar with Rank */}
              <div className="w-full max-w-4xl bg-card/60 backdrop-blur-sm border border-border rounded-xl p-4 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl"
                      style={{ 
                        borderColor: playerData?.rank?.color || 'hsl(var(--primary))',
                        backgroundColor: `${playerData?.rank?.color}20` || 'hsl(var(--primary)/0.2)',
                      }}
                    >
                      {playerData?.rank?.icon || '⬜'}
                    </div>
                    <div>
                      <p className="font-orbitron text-lg text-foreground">{playerData?.username}</p>
                      <p 
                        className="text-sm font-medium"
                        style={{ color: playerData?.rank?.color || 'hsl(var(--muted-foreground))' }}
                      >
                        {playerData?.rank?.name || 'Recruit'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* XP Progress */}
                    {playerData?.nextRank && (
                      <div className="hidden sm:block">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-gold" />
                          <span className="text-sm text-muted-foreground">
                            {playerData.xp?.toLocaleString()} XP
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <span 
                            className="text-sm font-medium"
                            style={{ color: playerData.nextRank.rank.color }}
                          >
                            {playerData.nextRank.rank.name}
                          </span>
                        </div>
                        <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-300"
                            style={{ 
                              width: `${(playerData.nextRank.progress || 0) * 100}%`,
                              backgroundColor: playerData.nextRank.rank.color,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-gold" />
                      <span className="font-orbitron text-gold text-xl">{playerData?.money?.toLocaleString() ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon={<Target className="w-6 h-6" />}
                  label="Kills"
                  value={playerData?.stats.kills ?? 0}
                  color="text-primary"
                />
                <StatCard
                  icon={<Skull className="w-6 h-6" />}
                  label="Deaths"
                  value={playerData?.stats.deaths ?? 0}
                  color="text-destructive"
                />
                <StatCard
                  icon={<Swords className="w-6 h-6" />}
                  label="K/D Ratio"
                  value={kd}
                  color="text-gold"
                />
                <StatCard
                  icon={<Flag className="w-6 h-6" />}
                  label="Captures"
                  value={playerData?.stats.flagCaptures ?? 0}
                  color="text-ally"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
                <Button
                  variant="battle"
                  size="xl"
                  className="flex-1 h-20 text-xl"
                  onClick={onEnterBattle}
                >
                  <Swords className="w-8 h-8 mr-2" />
                  ENTER BATTLE
                </Button>
                
                <Button
                  variant="garage"
                  size="xl"
                  className="flex-1 h-20 text-xl"
                  onClick={onOpenGarage}
                >
                  <Warehouse className="w-8 h-8 mr-2" />
                  GARAGE
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-muted-foreground text-sm">
            Server: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            {isAuthenticated && playerData && ` • Logged in as ${playerData.username}`}
          </p>
        </footer>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) => (
  <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
    <div className={`${color} mb-2 flex justify-center`}>{icon}</div>
    <p className="font-orbitron text-2xl text-foreground">{value}</p>
    <p className="text-muted-foreground text-sm uppercase tracking-wider">{label}</p>
  </div>
);
