
import React, { RefObject, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageInputProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  textareaRef?: RefObject<HTMLTextAreaElement>;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  message, 
  isLoading, 
  onMessageChange, 
  onSendMessage,
  textareaRef
}) => {
  const [localMessage, setLocalMessage] = useState('');
  const isMobile = useIsMobile();
  
  // Sync local state with prop when the prop changes
  useEffect(() => {
    setLocalMessage(message);
  }, [message]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalMessage(value);
    onMessageChange(value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localMessage.trim() || isLoading) return;
    
    onSendMessage(e);
    setLocalMessage(''); // Clear local input immediately
  };

  return (
    <div className={`p-3 bg-background border-t sticky bottom-0 z-10 ${
      isMobile ? 'pb-20' : 'pb-3'
    }`}>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Textarea
          ref={textareaRef}
          value={localMessage}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 min-h-[40px] max-h-[80px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (localMessage.trim()) {
                handleSubmit(e);
              }
            }
          }}
        />
        <Button 
          type="submit" 
          disabled={!localMessage.trim() || isLoading} 
          className="self-end rounded-full flex-shrink-0 w-10 h-10"
          size="icon"
          variant="default"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
