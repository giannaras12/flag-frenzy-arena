import { useState, useCallback, useEffect } from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Garage } from '@/components/garage/Garage';
import { Game } from '@/components/game/Game';
import { useGameConnection } from '@/hooks/useGameConnection';
import { useUISounds } from '@/hooks/useUISounds';
import { HULLS, GUNS, MAP_WALLS } from '@/lib/gameData';
import { PlayerData, GameState } from '@/lib/gameTypes';

type Screen = 'dashboard' | 'garage' | 'game';

// Mock player data for offline demo
const createMockPlayerData = (username: string): PlayerData => ({
  id: 'local-player',
  username,
  money: 10000,
  xp: 500,
  rank: { id: 3, name: 'Gefreiter', minXP: 500, color: '#4ade80', icon: '🟢' },
  nextRank: { rank: { id: 4, name: 'Corporal', minXP: 1500, color: '#22c55e', icon: '🟩' }, xpNeeded: 1000, progress: 0 },
  ownedHulls: ['wasp'],
  ownedGuns: ['smoky'],
  equippedHull: 'wasp',
  equippedGun: 'smoky',
  hullUpgrades: { wasp: 0 },
  gunUpgrades: { smoky: 0 },
  stats: { kills: 15, deaths: 8, flagCaptures: 3, flagReturns: 2, damageDealt: 5000 },
});

// Mock game state for offline demo
const createMockGameState = (playerId: string): GameState => {
  const hull = HULLS[0];
  const gun = GUNS[0];
  
  return {
    players: [
      {
        id: playerId,
        username: 'You',
        position: { x: 150, y: 400 },
        rotation: 0,
        turretRotation: 0,
        health: hull.baseHealth,
        maxHealth: hull.baseHealth,
        team: 'red',
        hull,
        gun,
        hasFlag: false,
        isAlive: true,
        rank: { id: 3, name: 'Gefreiter', minXP: 500, color: '#4ade80', icon: '🟢' },
      },
    ],
    flags: [
      { id: 'red-flag', team: 'red', position: { x: 80, y: 400 }, isAtBase: true, carriedBy: null },
      { id: 'blue-flag', team: 'blue', position: { x: 1120, y: 400 }, isAtBase: true, carriedBy: null },
    ],
    projectiles: [],
    walls: MAP_WALLS,
    redScore: 0,
    blueScore: 0,
    timeRemaining: 600,
    isRunning: true,
  };
};

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [localPlayerData, setLocalPlayerData] = useState<PlayerData | null>(null);
  const [localGameState, setLocalGameState] = useState<GameState | null>(null);
  
  const { playClick, playSuccess, playPurchase, playUpgrade, playEquip, playError } = useUISounds();
  
  const {
    isConnected,
    isConnecting,
    isAuthenticated,
    error,
    gameState: serverGameState,
    playerData: serverPlayerData,
    playerId,
    sessionToken,
    lastRankUp,
    lastXPGain,
    connect,
    register,
    login,
    joinBattle,
    leaveBattle,
    sendMessage,
    clearRankUp,
    clearXPGain,
  } = useGameConnection();

  // Use server data if connected, otherwise use local mock data
  const playerData = isAuthenticated ? serverPlayerData : localPlayerData;
  const gameState = isAuthenticated ? serverGameState : localGameState;
  const currentPlayerId = isAuthenticated ? playerId : 'local-player';

  const handleConnect = useCallback(() => {
    playClick();
    connect();
  }, [connect, playClick]);

  const handleLogin = useCallback((username: string, password: string) => {
    playClick();
    login(username, password);
  }, [login, playClick]);

  const handleRegister = useCallback((username: string, password: string) => {
    playClick();
    register(username, password);
  }, [register, playClick]);

  const handleEnterBattle = useCallback(() => {
    playClick();
    if (isAuthenticated && sessionToken) {
      joinBattle();
    } else {
      // Create mock game state for offline play
      setLocalGameState(createMockGameState('local-player'));
      if (!localPlayerData) {
        setLocalPlayerData(createMockPlayerData('Guest'));
      }
    }
    setCurrentScreen('game');
  }, [isAuthenticated, sessionToken, joinBattle, playClick, localPlayerData]);

  const handleOpenGarage = useCallback(() => {
    playClick();
    if (isAuthenticated && sessionToken) {
      sendMessage({ type: 'getGarage', sessionToken });
    }
    setCurrentScreen('garage');
  }, [isAuthenticated, sessionToken, sendMessage, playClick]);

  const handleExitBattle = useCallback(() => {
    if (isAuthenticated) {
      leaveBattle();
    }
    setLocalGameState(null);
    setCurrentScreen('dashboard');
  }, [isAuthenticated, leaveBattle]);

  const handleBuyHull = useCallback((hullId: string) => {
    if (isAuthenticated && sessionToken) {
      sendMessage({ type: 'buyHull', sessionToken, hullId });
      playPurchase();
    } else if (localPlayerData) {
      const hull = HULLS.find(h => h.id === hullId);
      if (hull && localPlayerData.money >= hull.price) {
        setLocalPlayerData({
          ...localPlayerData,
          money: localPlayerData.money - hull.price,
          ownedHulls: [...localPlayerData.ownedHulls, hullId],
          hullUpgrades: { ...localPlayerData.hullUpgrades, [hullId]: 0 },
        });
        playPurchase();
      } else {
        playError();
      }
    }
  }, [isAuthenticated, sessionToken, sendMessage, localPlayerData, playPurchase, playError]);

  const handleBuyGun = useCallback((gunId: string) => {
    if (isAuthenticated && sessionToken) {
      sendMessage({ type: 'buyGun', sessionToken, gunId });
      playPurchase();
    } else if (localPlayerData) {
      const gun = GUNS.find(g => g.id === gunId);
      if (gun && localPlayerData.money >= gun.price) {
        setLocalPlayerData({
          ...localPlayerData,
          money: localPlayerData.money - gun.price,
          ownedGuns: [...localPlayerData.ownedGuns, gunId],
          gunUpgrades: { ...localPlayerData.gunUpgrades, [gunId]: 0 },
        });
        playPurchase();
      } else {
        playError();
      }
    }
  }, [isAuthenticated, sessionToken, sendMessage, localPlayerData, playPurchase, playError]);

  const handleUpgradeHull = useCallback((hullId: string) => {
    if (isAuthenticated && sessionToken) {
      sendMessage({ type: 'upgradeHull', sessionToken, hullId });
      playUpgrade();
    } else if (localPlayerData) {
      const currentLevel = localPlayerData.hullUpgrades[hullId] || 0;
      const cost = Math.floor(1000 * Math.pow(1.5, currentLevel));
      if (localPlayerData.money >= cost && currentLevel < 20) {
        setLocalPlayerData({
          ...localPlayerData,
          money: localPlayerData.money - cost,
          hullUpgrades: { ...localPlayerData.hullUpgrades, [hullId]: currentLevel + 1 },
        });
        playUpgrade();
      } else {
        playError();
      }
    }
  }, [isAuthenticated, sessionToken, sendMessage, localPlayerData, playUpgrade, playError]);

  const handleUpgradeGun = useCallback((gunId: string) => {
    if (isAuthenticated && sessionToken) {
      sendMessage({ type: 'upgradeGun', sessionToken, gunId });
      playUpgrade();
    } else if (localPlayerData) {
      const currentLevel = localPlayerData.gunUpgrades[gunId] || 0;
      const cost = Math.floor(1000 * Math.pow(1.5, currentLevel));
      if (localPlayerData.money >= cost && currentLevel < 20) {
        setLocalPlayerData({
          ...localPlayerData,
          money: localPlayerData.money - cost,
          gunUpgrades: { ...localPlayerData.gunUpgrades, [gunId]: currentLevel + 1 },
        });
        playUpgrade();
      } else {
        playError();
      }
    }
  }, [isAuthenticated, sessionToken, sendMessage, localPlayerData, playUpgrade, playError]);

  const handleEquipHull = useCallback((hullId: string) => {
    playEquip();
    if (isAuthenticated && sessionToken) {
      sendMessage({ type: 'equipHull', sessionToken, hullId });
    } else if (localPlayerData) {
      setLocalPlayerData({ ...localPlayerData, equippedHull: hullId });
    }
  }, [isAuthenticated, sessionToken, sendMessage, localPlayerData, playEquip]);

  const handleEquipGun = useCallback((gunId: string) => {
    playEquip();
    if (isAuthenticated && sessionToken) {
      sendMessage({ type: 'equipGun', sessionToken, gunId });
    } else if (localPlayerData) {
      setLocalPlayerData({ ...localPlayerData, equippedGun: gunId });
    }
  }, [isAuthenticated, sessionToken, sendMessage, localPlayerData, playEquip]);

  // Game controls
  const handleMove = useCallback((direction: { x: number; y: number }) => {
    if (isAuthenticated) {
      sendMessage({ type: 'move', direction });
    } else if (localGameState) {
      setLocalGameState(prev => {
        if (!prev) return null;
        const player = prev.players.find(p => p.id === 'local-player');
        if (!player) return prev;
        
        const speed = player.hull.baseSpeed;
        const newPos = {
          x: Math.max(30, Math.min(1170, player.position.x + direction.x * speed)),
          y: Math.max(30, Math.min(770, player.position.y + direction.y * speed)),
        };
        
        return {
          ...prev,
          players: prev.players.map(p => 
            p.id === 'local-player' ? { ...p, position: newPos } : p
          ),
        };
      });
    }
  }, [isAuthenticated, sendMessage, localGameState]);

  const handleRotate = useCallback((angle: number) => {
    if (isAuthenticated) {
      sendMessage({ type: 'rotate', angle });
    } else {
      setLocalGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.map(p => 
            p.id === 'local-player' ? { ...p, rotation: angle } : p
          ),
        };
      });
    }
  }, [isAuthenticated, sendMessage]);

  const handleRotateTurret = useCallback((angle: number) => {
    if (isAuthenticated) {
      sendMessage({ type: 'rotateTurret', angle });
    } else {
      setLocalGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.map(p => 
            p.id === 'local-player' ? { ...p, turretRotation: angle } : p
          ),
        };
      });
    }
  }, [isAuthenticated, sendMessage]);

  const handleShoot = useCallback(() => {
    if (isAuthenticated) {
      sendMessage({ type: 'shoot' });
    }
  }, [isAuthenticated, sendMessage]);

  const handleInteract = useCallback(() => {
    if (isAuthenticated) {
      sendMessage({ type: 'interact' });
    }
  }, [isAuthenticated, sendMessage]);

  return (
    <>
      {currentScreen === 'dashboard' && (
        <Dashboard
          playerData={playerData}
          onEnterBattle={handleEnterBattle}
          onOpenGarage={handleOpenGarage}
          onConnect={handleConnect}
          onLogin={handleLogin}
          onRegister={handleRegister}
          isConnected={isConnected}
          isConnecting={isConnecting}
          isAuthenticated={isAuthenticated || !!localPlayerData}
          error={error}
        />
      )}
      
      {currentScreen === 'garage' && (
        <Garage
          playerData={playerData}
          onBack={() => setCurrentScreen('dashboard')}
          onBuyHull={handleBuyHull}
          onBuyGun={handleBuyGun}
          onUpgradeHull={handleUpgradeHull}
          onUpgradeGun={handleUpgradeGun}
          onEquipHull={handleEquipHull}
          onEquipGun={handleEquipGun}
        />
      )}
      
      {currentScreen === 'game' && gameState && currentPlayerId && (
        <Game
          gameState={gameState}
          playerId={currentPlayerId}
          playerData={playerData}
          onMove={handleMove}
          onRotate={handleRotate}
          onRotateTurret={handleRotateTurret}
          onShoot={handleShoot}
          onInteract={handleInteract}
          onExitBattle={handleExitBattle}
          lastRankUp={lastRankUp}
          lastXPGain={lastXPGain}
          onClearRankUp={clearRankUp}
          onClearXPGain={clearXPGain}
        />
      )}
    </>
  );
};

export default Index;
