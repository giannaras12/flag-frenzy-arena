import { useSound } from '@/contexts/SoundContext';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SoundControls = () => {
  const { isMuted, toggleMute, volume, setVolume } = useSound();

  return (
    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="h-8 w-8"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Volume2 className="w-4 h-4 text-primary" />
        )}
      </Button>
      
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-20 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        disabled={isMuted}
      />
    </div>
  );
};
