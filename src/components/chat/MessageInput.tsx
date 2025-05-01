
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';

interface MessageInputProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  message, 
  isLoading, 
  onMessageChange, 
  onSendMessage 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="p-3 bg-background border-t mt-auto">
      <form onSubmit={onSendMessage} className="flex space-x-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 min-h-[40px] max-h-[80px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (message.trim()) {
                onSendMessage(e);
              }
            }
          }}
          autoFocus
        />
        <Button 
          type="submit" 
          disabled={!message.trim() || isLoading} 
          className="self-end rounded-full"
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
