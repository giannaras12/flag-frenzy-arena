import { useState, useEffect, useCallback, useRef } from 'react';
import { SERVER_CONFIG } from '@/config/serverConfig';
import { 
  ClientMessage, 
  ServerMessage, 
  GameState, 
  PlayerData,
  Hull,
  Gun,
  Rank,
  NextRankInfo,
} from '@/lib/gameTypes';

interface UseGameConnectionReturn {
  isConnected: boolean;
  isConnecting: boolean;
  isAuthenticated: boolean;
  error: string | null;
  gameState: GameState | null;
  playerData: PlayerData | null;
  garageHulls: Hull[];
  garageGuns: Gun[];
  playerId: string | null;
  sessionToken: string | null;
  lastRankUp: { oldRank: Rank; newRank: Rank } | null;
  lastXPGain: { amount: number; newXP: number } | null;
  connect: () => void;
  disconnect: () => void;
  register: (username: string, password: string) => void;
  login: (username: string, password: string) => void;
  joinBattle: () => void;
  leaveBattle: () => void;
  sendMessage: (message: ClientMessage) => void;
  clearRankUp: () => void;
  clearXPGain: () => void;
  lastEvent: ServerMessage | null;
}

export const useGameConnection = (): UseGameConnectionReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [garageHulls, setGarageHulls] = useState<Hull[]>([]);
  const [garageGuns, setGarageGuns] = useState<Gun[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<ServerMessage | null>(null);
  const [lastRankUp, setLastRankUp] = useState<{ oldRank: Rank; newRank: Rank } | null>(null);
  const [lastXPGain, setLastXPGain] = useState<{ amount: number; newXP: number } | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: ServerMessage = JSON.parse(event.data);
      setLastEvent(message);
      
      switch (message.type) {
        case 'authSuccess':
          setSessionToken(message.sessionToken);
          setPlayerData(message.playerData);
          setPlayerId(message.playerData.id);
          setIsAuthenticated(true);
          setError(null);
          // Store session in localStorage for persistence
          localStorage.setItem('flagwars_session', message.sessionToken);
          break;

        case 'battleJoined':
          setPlayerId(message.playerId);
          setPlayerData(message.playerData);
          break;
          
        case 'gameState':
          setGameState(message.state);
          break;
          
        case 'garageData':
          setGarageHulls(message.hulls);
          setGarageGuns(message.guns);
          setPlayerData(message.playerData);
          break;
          
        case 'purchaseResult':
        case 'upgradeResult':
          if (message.playerData) {
            setPlayerData(message.playerData);
          }
          break;

        case 'rankUp':
          setLastRankUp({ oldRank: message.oldRank, newRank: message.newRank });
          // Update player data with new rank
          setPlayerData(prev => prev ? { ...prev, xp: message.newXP, rank: message.newRank } : null);
          break;

        case 'xpGain':
          setLastXPGain({ amount: message.amount, newXP: message.newXP });
          setPlayerData(prev => prev ? { 
            ...prev, 
            xp: message.newXP, 
            rank: message.currentRank,
            nextRank: message.nextRank,
          } : null);
          break;
          
        case 'error':
          setError(message.message);
          break;
      }
    } catch (err) {
      console.error('Failed to parse server message:', err);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(SERVER_CONFIG.url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      };

      ws.onmessage = handleMessage;

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setIsAuthenticated(false);
        wsRef.current = null;
      };

      ws.onerror = () => {
        setError('Connection failed. Make sure the server is running.');
        setIsConnecting(false);
      };
    } catch (err) {
      setError('Failed to create connection');
      setIsConnecting(false);
    }
  }, [handleMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsAuthenticated(false);
    setPlayerId(null);
    setSessionToken(null);
    setGameState(null);
    localStorage.removeItem('flagwars_session');
  }, []);

  const register = useCallback((username: string, password: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setError(null);
      wsRef.current.send(JSON.stringify({ type: 'register', username, password }));
    }
  }, []);

  const login = useCallback((username: string, password: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setError(null);
      wsRef.current.send(JSON.stringify({ type: 'login', username, password }));
    }
  }, []);

  const joinBattle = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && sessionToken) {
      wsRef.current.send(JSON.stringify({ type: 'joinBattle', sessionToken }));
    }
  }, [sessionToken]);

  const leaveBattle = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leaveBattle' }));
      setGameState(null);
    }
  }, []);

  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const clearRankUp = useCallback(() => {
    setLastRankUp(null);
  }, []);

  const clearXPGain = useCallback(() => {
    setLastXPGain(null);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    isAuthenticated,
    error,
    gameState,
    playerData,
    garageHulls,
    garageGuns,
    playerId,
    sessionToken,
    lastRankUp,
    lastXPGain,
    connect,
    disconnect,
    register,
    login,
    joinBattle,
    leaveBattle,
    sendMessage,
    clearRankUp,
    clearXPGain,
    lastEvent,
  };
};
