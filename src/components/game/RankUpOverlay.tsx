import { useEffect, useState } from 'react';
import { Rank } from '@/lib/gameTypes';
import { Star, ChevronUp } from 'lucide-react';

interface RankUpOverlayProps {
  oldRank: Rank;
  newRank: Rank;
  onComplete: () => void;
}

export const RankUpOverlay = ({ oldRank, newRank, onComplete }: RankUpOverlayProps) => {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('show'), 100);
    const showTimer = setTimeout(() => setPhase('exit'), 4000);
    const exitTimer = setTimeout(() => onComplete(), 4500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
        phase === 'enter' ? 'opacity-0' : phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      
      {/* Rank up content */}
      <div 
        className={`relative flex flex-col items-center gap-6 transition-all duration-700 ${
          phase === 'show' ? 'scale-100 translate-y-0' : 'scale-75 translate-y-10'
        }`}
      >
        {/* Stars animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <Star
              key={i}
              className="absolute text-gold animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
                width: `${16 + Math.random() * 16}px`,
                height: `${16 + Math.random() * 16}px`,
              }}
            />
          ))}
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="text-gold font-orbitron text-2xl mb-2 animate-pulse">RANK UP!</p>
        </div>

        {/* Old rank */}
        <div className="flex flex-col items-center opacity-50">
          <div 
            className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-3xl mb-2"
            style={{ borderColor: oldRank.color, backgroundColor: `${oldRank.color}20` }}
          >
            {oldRank.icon}
          </div>
          <p className="font-orbitron text-lg" style={{ color: oldRank.color }}>
            {oldRank.name}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center">
          <ChevronUp className="w-8 h-8 text-gold animate-bounce" />
          <ChevronUp className="w-8 h-8 text-gold animate-bounce -mt-4" style={{ animationDelay: '0.1s' }} />
        </div>

        {/* New rank */}
        <div 
          className={`flex flex-col items-center transition-all duration-500 ${
            phase === 'show' ? 'scale-110' : 'scale-100'
          }`}
        >
          <div 
            className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl mb-3 shadow-2xl"
            style={{ 
              borderColor: newRank.color, 
              backgroundColor: `${newRank.color}30`,
              boxShadow: `0 0 40px ${newRank.color}80`,
            }}
          >
            {newRank.icon}
          </div>
          <p 
            className="font-orbitron text-2xl font-bold"
            style={{ color: newRank.color, textShadow: `0 0 20px ${newRank.color}` }}
          >
            {newRank.name}
          </p>
        </div>
      </div>
    </div>
  );
};
