import { useState, useEffect, useCallback, useRef } from 'react';
import { SERVER_CONFIG } from '@/config/serverConfig';
import { 
  ClientMessage, 
  ServerMessage, 
  GameState, 
  PlayerData,
  Hull,
  Gun 
} from '@/lib/gameTypes';

interface UseGameConnectionReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  gameState: GameState | null;
  playerData: PlayerData | null;
  garageHulls: Hull[];
  garageGuns: Gun[];
  playerId: string | null;
  connect: (username: string) => void;
  disconnect: () => void;
  sendMessage: (message: ClientMessage) => void;
  lastEvent: ServerMessage | null;
}

export const useGameConnection = (): UseGameConnectionReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [garageHulls, setGarageHulls] = useState<Hull[]>([]);
  const [garageGuns, setGarageGuns] = useState<Gun[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<ServerMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: ServerMessage = JSON.parse(event.data);
      setLastEvent(message);
      
      switch (message.type) {
        case 'welcome':
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
          
        case 'error':
          setError(message.message);
          break;
      }
    } catch (err) {
      console.error('Failed to parse server message:', err);
    }
  }, []);

  const connect = useCallback((username: string) => {
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
        
        // Send join message
        ws.send(JSON.stringify({ type: 'join', username }));
      };

      ws.onmessage = handleMessage;

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
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
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setPlayerId(null);
    setGameState(null);
  }, []);

  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    gameState,
    playerData,
    garageHulls,
    garageGuns,
    playerId,
    connect,
    disconnect,
    sendMessage,
    lastEvent,
  };
};
