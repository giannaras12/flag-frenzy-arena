import { useCallback, useRef, useEffect } from 'react';

interface SoundEffectsReturn {
  playShoot: (gunType?: string) => void;
  playExplosion: (size?: 'small' | 'medium' | 'large') => void;
  playFlagPickup: () => void;
  playFlagCapture: () => void;
  playFlagDrop: () => void;
  playTankMove: () => void;
  stopTankMove: () => void;
  playHit: () => void;
  playDeath: () => void;
  setMasterVolume: (volume: number) => void;
}

export const useSoundEffects = (): SoundEffectsReturn => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const tankMoveOscRef = useRef<OscillatorNode | null>(null);
  const tankMoveGainRef = useRef<GainNode | null>(null);

  // Initialize audio context on first user interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.3;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
    
    // Resume if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    return { ctx: audioContextRef.current, masterGain: masterGainRef.current! };
  }, []);

  // Shooting sound - varies by gun type
  const playShoot = useCallback((gunType: string = 'normal') => {
    const { ctx, masterGain } = getAudioContext();
    const now = ctx.currentTime;

    const gainNode = ctx.createGain();
    gainNode.connect(masterGain);

    switch (gunType) {
      case 'laser': {
        // High-pitched laser sound
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2000, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'plasma': {
        // Plasma whoosh
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'railgun': {
        // Electric railgun charge and fire
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'explosive':
      case 'thunder': {
        // Deep cannon boom
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.3);
        
        // Add noise burst
        const bufferSize = ctx.sampleRate * 0.1;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        noise.connect(noiseGain);
        noiseGain.connect(masterGain);
        noise.start(now);
        break;
      }
      default: {
        // Standard shot - punchy
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    }
  }, [getAudioContext]);

  // Explosion sound
  const playExplosion = useCallback((size: 'small' | 'medium' | 'large' = 'medium') => {
    const { ctx, masterGain } = getAudioContext();
    const now = ctx.currentTime;

    const durations = { small: 0.3, medium: 0.5, large: 0.8 };
    const volumes = { small: 0.3, medium: 0.5, large: 0.7 };
    const duration = durations[size];
    const volume = volumes[size];

    // Low rumble
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + duration);
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    osc.start(now);
    osc.stop(now + duration);

    // Noise burst for explosion crackle
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    noise.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(now);
  }, [getAudioContext]);

  // Flag pickup - triumphant ascending tone
  const playFlagPickup = useCallback(() => {
    const { ctx, masterGain } = getAudioContext();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord arpeggio
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gainNode.gain.setValueAtTime(0, now + i * 0.1);
      gainNode.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      osc.connect(gainNode);
      gainNode.connect(masterGain);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }, [getAudioContext]);

  // Flag capture - victory fanfare
  const playFlagCapture = useCallback(() => {
    const { ctx, masterGain } = getAudioContext();
    const now = ctx.currentTime;

    // Victory chord
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.setValueAtTime(0.15, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      osc.connect(gainNode);
      gainNode.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.8);
    });

    // Second hit
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 783.99; // G5
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gainNode);
      gainNode.connect(masterGain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    }, 400);
  }, [getAudioContext]);

  // Flag drop - descending sad tone
  const playFlagDrop = useCallback(() => {
    const { ctx, masterGain } = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }, [getAudioContext]);

  // Tank movement - continuous engine rumble
  const playTankMove = useCallback(() => {
    const { ctx, masterGain } = getAudioContext();
    
    if (tankMoveOscRef.current) return; // Already playing

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.value = 35;
    gainNode.gain.value = 0.08;
    
    // Add slight frequency wobble for engine feel
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 8;
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    osc.start();
    lfo.start();
    
    tankMoveOscRef.current = osc;
    tankMoveGainRef.current = gainNode;
  }, [getAudioContext]);

  const stopTankMove = useCallback(() => {
    if (tankMoveOscRef.current && tankMoveGainRef.current) {
      const { ctx } = getAudioContext();
      tankMoveGainRef.current.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      tankMoveOscRef.current.stop(ctx.currentTime + 0.15);
      tankMoveOscRef.current = null;
      tankMoveGainRef.current = null;
    }
  }, [getAudioContext]);

  // Hit marker sound
  const playHit = useCallback(() => {
    const { ctx, masterGain } = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }, [getAudioContext]);

  // Death sound
  const playDeath = useCallback(() => {
    const { ctx, masterGain } = getAudioContext();
    const now = ctx.currentTime;

    // Low descending tone
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.5);

    // Explosion on top
    playExplosion('large');
  }, [getAudioContext, playExplosion]);

  // Master volume control
  const setMasterVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTankMove();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopTankMove]);

  return {
    playShoot,
    playExplosion,
    playFlagPickup,
    playFlagCapture,
    playFlagDrop,
    playTankMove,
    stopTankMove,
    playHit,
    playDeath,
    setMasterVolume,
  };
};
