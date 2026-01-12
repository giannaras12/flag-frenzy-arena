import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface ChatMessage {
  id: string;
  playerName: string;
  team: 'red' | 'blue';
  message: string;
  timestamp: number;
  isSystem?: boolean;
}

interface TeamChatProps {
  messages: ChatMessage[];
  currentTeam: 'red' | 'blue';
  onSendMessage: (message: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const TeamChat = ({ messages, currentTeam, onSendMessage, isOpen, onToggle }: TeamChatProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onToggle();
    }
    // Stop propagation so game doesn't receive input
    e.stopPropagation();
  };

  // Filter to show only team messages
  const teamMessages = messages.filter(m => m.team === currentTeam || m.isSystem);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-card transition-colors"
      >
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Press T to chat</span>
        {messages.length > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[400px] bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`px-3 py-2 border-b border-border flex items-center justify-between ${
        currentTeam === 'red' ? 'bg-destructive/20' : 'bg-ally/20'
      }`}>
        <div className="flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 ${currentTeam === 'red' ? 'text-destructive' : 'text-ally'}`} />
          <span className={`font-orbitron text-sm ${currentTeam === 'red' ? 'text-destructive' : 'text-ally'}`}>
            TEAM CHAT
          </span>
        </div>
        <button
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ESC to close
        </button>
      </div>

      {/* Messages */}
      <div className="h-[150px] overflow-y-auto p-2 space-y-1">
        {teamMessages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-4">
            No messages yet. Say hello to your team!
          </p>
        ) : (
          teamMessages.map((msg) => (
            <div key={msg.id} className="text-sm">
              {msg.isSystem ? (
                <span className="text-gold italic">{msg.message}</span>
              ) : (
                <>
                  <span className={msg.team === 'red' ? 'text-destructive' : 'text-ally'}>
                    {msg.playerName}:
                  </span>
                  <span className="text-foreground ml-2">{msg.message}</span>
                </>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-border flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 h-8 text-sm bg-background"
          maxLength={100}
        />
        <Button type="submit" size="sm" className="h-8 px-3">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
