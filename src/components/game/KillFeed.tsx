import { useEffect, useState } from 'react';
import { Skull, Flag, Undo2 } from 'lucide-react';

export interface KillFeedEvent {
  id: string;
  type: 'kill' | 'flagCapture' | 'flagReturn' | 'flagPickup';
  killerName?: string;
  killerTeam?: 'red' | 'blue';
  victimName?: string;
  victimTeam?: 'red' | 'blue';
  playerName?: string;
  playerTeam?: 'red' | 'blue';
  flagTeam?: 'red' | 'blue';
  timestamp: number;
}

interface KillFeedProps {
  events: KillFeedEvent[];
}

export const KillFeed = ({ events }: KillFeedProps) => {
  const [visibleEvents, setVisibleEvents] = useState<KillFeedEvent[]>([]);

  useEffect(() => {
    setVisibleEvents(events.slice(-5)); // Show last 5 events
  }, [events]);

  const getEventIcon = (type: KillFeedEvent['type']) => {
    switch (type) {
      case 'kill':
        return <Skull className="w-4 h-4 text-destructive" />;
      case 'flagCapture':
        return <Flag className="w-4 h-4 text-gold" />;
      case 'flagReturn':
        return <Undo2 className="w-4 h-4 text-primary" />;
      case 'flagPickup':
        return <Flag className="w-4 h-4 text-gold" />;
    }
  };

  const renderEvent = (event: KillFeedEvent) => {
    const teamColor = (team?: 'red' | 'blue') => 
      team === 'red' ? 'text-destructive' : 'text-ally';

    switch (event.type) {
      case 'kill':
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className={teamColor(event.killerTeam)}>{event.killerName}</span>
            {getEventIcon('kill')}
            <span className={teamColor(event.victimTeam)}>{event.victimName}</span>
          </div>
        );
      case 'flagCapture':
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className={teamColor(event.playerTeam)}>{event.playerName}</span>
            {getEventIcon('flagCapture')}
            <span className="text-gold">captured the flag!</span>
          </div>
        );
      case 'flagReturn':
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className={teamColor(event.playerTeam)}>{event.playerName}</span>
            {getEventIcon('flagReturn')}
            <span className="text-muted-foreground">returned the flag</span>
          </div>
        );
      case 'flagPickup':
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className={teamColor(event.playerTeam)}>{event.playerName}</span>
            {getEventIcon('flagPickup')}
            <span className="text-muted-foreground">picked up the flag</span>
          </div>
        );
    }
  };

  if (visibleEvents.length === 0) return null;

  return (
    <div className="absolute top-20 right-4 space-y-1 min-w-[250px]">
      {visibleEvents.map((event) => (
        <div
          key={event.id}
          className="bg-card/80 backdrop-blur-sm border border-border rounded px-3 py-1.5 animate-fade-in"
        >
          {renderEvent(event)}
        </div>
      ))}
    </div>
  );
};
