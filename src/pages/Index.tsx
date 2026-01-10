import { useState, useCallback } from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Garage } from '@/components/garage/Garage';
import { Game } from '@/components/game/Game';
import { useGameConnection } from '@/hooks/useGameConnection';
import { useUISounds } from '@/hooks/useUISounds';
import { HULLS, GUNS } from '@/lib/gameData';
import { PlayerData, GameState, Flag, Wall, Player } from '@/lib/gameTypes';
import { MAP_WALLS } from '@/lib/gameData';

type Screen = 'dashboard' | 'garage' | 'game';

// Mock player data for demo (when not connected to server)
const createMockPlayerData = (username: string): PlayerData => ({
  id: 'local-player',
  username,
  money: 10000,
  ownedHulls: ['wasp'],
  ownedGuns: ['smoky'],
  equippedHull: 'wasp',
  equippedGun: 'smoky',
  hullUpgrades: { wasp: 0 },
  gunUpgrades: { smoky: 0 },
  stats: {
    kills: 15,
    deaths: 8,
    flagCaptures: 3,
    flagReturns: 2,
    damageDealt: 5000,
  },
});

// Mock game state for demo
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
      },
      {
        id: 'enemy-1',
        username: 'Enemy1',
        position: { x: 1050, y: 300 },
        rotation: Math.PI,
        turretRotation: Math.PI,
        health: hull.baseHealth,
        maxHealth: hull.baseHealth,
        team: 'blue',
        hull,
        gun,
        hasFlag: false,
        isAlive: true,
      },
    ],
    flags: [
      {
        id: 'red-flag',
        team: 'red',
        position: { x: 80, y: 400 },
        isAtBase: true,
        carriedBy: null,
      },
      {
        id: 'blue-flag',
        team: 'blue',
        position: { x: 1120, y: 400 },
        isAtBase: true,
        carriedBy: null,
      },
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
    error,
    gameState: serverGameState,
    playerData: serverPlayerData,
    playerId,
    connect,
    sendMessage,
  } = useGameConnection();

  // Use server data if connected, otherwise use local mock data
  const playerData = isConnected ? serverPlayerData : localPlayerData;
  const gameState = isConnected ? serverGameState : localGameState;
  const currentPlayerId = isConnected ? playerId : 'local-player';

  const handleConnect = useCallback((username: string) => {
    playClick();
    // Try to connect to server
    connect(username);
    
    // Also create local mock data for offline play
    const mockData = createMockPlayerData(username);
    setLocalPlayerData(mockData);
    playSuccess();
  }, [connect, playClick, playSuccess]);

  const handleEnterBattle = useCallback(() => {
    playClick();
    if (isConnected) {
      // Request to join battle from server
    } else {
      // Create mock game state for offline play
      setLocalGameState(createMockGameState('local-player'));
    }
    setCurrentScreen('game');
  }, [isConnected, playClick]);

  const handleOpenGarage = useCallback(() => {
    playClick();
    if (isConnected) {
      sendMessage({ type: 'getGarage' });
    }
    setCurrentScreen('garage');
  }, [isConnected, sendMessage, playClick]);

  const handleExitBattle = useCallback(() => {
    setLocalGameState(null);
    setCurrentScreen('dashboard');
  }, []);

  const handleBuyHull = useCallback((hullId: string) => {
    if (isConnected) {
      sendMessage({ type: 'buyHull', hullId });
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
  }, [isConnected, sendMessage, localPlayerData, playPurchase, playError]);

  const handleBuyGun = useCallback((gunId: string) => {
    if (isConnected) {
      sendMessage({ type: 'buyGun', gunId });
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
  }, [isConnected, sendMessage, localPlayerData, playPurchase, playError]);

  const handleUpgradeHull = useCallback((hullId: string) => {
    if (isConnected) {
      sendMessage({ type: 'upgradeHull', hullId });
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
  }, [isConnected, sendMessage, localPlayerData, playUpgrade, playError]);

  const handleUpgradeGun = useCallback((gunId: string) => {
    if (isConnected) {
      sendMessage({ type: 'upgradeGun', gunId });
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
  }, [isConnected, sendMessage, localPlayerData, playUpgrade, playError]);

  const handleEquipHull = useCallback((hullId: string) => {
    playEquip();
    if (isConnected) {
      sendMessage({ type: 'equipHull', hullId });
    } else if (localPlayerData) {
      setLocalPlayerData({ ...localPlayerData, equippedHull: hullId });
    }
  }, [isConnected, sendMessage, localPlayerData, playEquip]);

  const handleEquipGun = useCallback((gunId: string) => {
    playEquip();
    if (isConnected) {
      sendMessage({ type: 'equipGun', gunId });
    } else if (localPlayerData) {
      setLocalPlayerData({ ...localPlayerData, equippedGun: gunId });
    }
  }, [isConnected, sendMessage, localPlayerData, playEquip]);

  // Game controls
  const handleMove = useCallback((direction: { x: number; y: number }) => {
    if (isConnected) {
      sendMessage({ type: 'move', direction });
    } else if (localGameState) {
      // Local movement for demo
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
  }, [isConnected, sendMessage, localGameState]);

  const handleRotate = useCallback((angle: number) => {
    if (isConnected) {
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
  }, [isConnected, sendMessage]);

  const handleRotateTurret = useCallback((angle: number) => {
    if (isConnected) {
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
  }, [isConnected, sendMessage]);

  const handleShoot = useCallback(() => {
    if (isConnected) {
      sendMessage({ type: 'shoot' });
    }
    // Local shooting would be handled here
  }, [isConnected, sendMessage]);

  const handleInteract = useCallback(() => {
    if (isConnected) {
      sendMessage({ type: 'interact' });
    }
    // Local flag interaction would be handled here
  }, [isConnected, sendMessage]);

  return (
    <>
      {currentScreen === 'dashboard' && (
        <Dashboard
          playerData={playerData}
          onEnterBattle={handleEnterBattle}
          onOpenGarage={handleOpenGarage}
          onConnect={handleConnect}
          isConnected={isConnected || !!localPlayerData}
          isConnecting={isConnecting}
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
      
      {currentScreen === 'game' && (
        <Game
          gameState={gameState}
          playerId={currentPlayerId}
          onMove={handleMove}
          onRotate={handleRotate}
          onRotateTurret={handleRotateTurret}
          onShoot={handleShoot}
          onInteract={handleInteract}
          onExitBattle={handleExitBattle}
        />
      )}
    </>
  );
};

export default Index;
