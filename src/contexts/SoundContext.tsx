import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface SoundContextType {
  playShoot: (gunType?: string) => void;
  playExplosion: (size?: 'small' | 'medium' | 'large') => void;
  playFlagPickup: () => void;
  playFlagCapture: () => void;
  playFlagDrop: () => void;
  playTankMove: () => void;
  stopTankMove: () => void;
  playHit: () => void;
  playDeath: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (v: number) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  
  const sounds = useSoundEffects();

  const wrappedPlayShoot = useCallback((gunType?: string) => {
    if (!isMuted) sounds.playShoot(gunType);
  }, [isMuted, sounds]);

  const wrappedPlayExplosion = useCallback((size?: 'small' | 'medium' | 'large') => {
    if (!isMuted) sounds.playExplosion(size);
  }, [isMuted, sounds]);

  const wrappedPlayFlagPickup = useCallback(() => {
    if (!isMuted) sounds.playFlagPickup();
  }, [isMuted, sounds]);

  const wrappedPlayFlagCapture = useCallback(() => {
    if (!isMuted) sounds.playFlagCapture();
  }, [isMuted, sounds]);

  const wrappedPlayFlagDrop = useCallback(() => {
    if (!isMuted) sounds.playFlagDrop();
  }, [isMuted, sounds]);

  const wrappedPlayTankMove = useCallback(() => {
    if (!isMuted) sounds.playTankMove();
  }, [isMuted, sounds]);

  const wrappedStopTankMove = useCallback(() => {
    sounds.stopTankMove();
  }, [sounds]);

  const wrappedPlayHit = useCallback(() => {
    if (!isMuted) sounds.playHit();
  }, [isMuted, sounds]);

  const wrappedPlayDeath = useCallback(() => {
    if (!isMuted) sounds.playDeath();
  }, [isMuted, sounds]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (!isMuted) {
      sounds.stopTankMove();
    }
  }, [isMuted, sounds]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    sounds.setMasterVolume(v);
  }, [sounds]);

  return (
    <SoundContext.Provider value={{
      playShoot: wrappedPlayShoot,
      playExplosion: wrappedPlayExplosion,
      playFlagPickup: wrappedPlayFlagPickup,
      playFlagCapture: wrappedPlayFlagCapture,
      playFlagDrop: wrappedPlayFlagDrop,
      playTankMove: wrappedPlayTankMove,
      stopTankMove: wrappedStopTankMove,
      playHit: wrappedPlayHit,
      playDeath: wrappedPlayDeath,
      isMuted,
      toggleMute,
      volume,
      setVolume,
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
