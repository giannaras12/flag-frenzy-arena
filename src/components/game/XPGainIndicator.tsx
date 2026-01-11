import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface XPGainIndicatorProps {
  amount: number;
  onComplete: () => void;
}

export const XPGainIndicator = ({ amount, onComplete }: XPGainIndicatorProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="flex items-center gap-2 bg-gold/20 border border-gold/50 rounded-full px-4 py-2 backdrop-blur-sm">
        <Star className="w-5 h-5 text-gold" />
        <span className="font-orbitron text-gold text-lg">+{amount} XP</span>
      </div>
    </div>
  );
};
