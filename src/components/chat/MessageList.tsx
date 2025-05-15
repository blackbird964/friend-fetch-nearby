
import React, { useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Message } from '@/context/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  fetchError?: string | null;
  hasMoreMessages?: boolean;
  loadMoreMessages?: () => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading, 
  fetchError,
  hasMoreMessages,
  loadMoreMessages
}) => {
  const { currentUser } = useAppContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef<number>(messages.length);
  const wasAtBottom = useRef<boolean>(true);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const checkIfAtBottom = () => {
      if (!containerRef.current) return true;
      
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      return isAtBottom;
    };
    
    // If we were at the bottom before receiving a new message, scroll to bottom again
    const isNewMessage = messages.length > prevMessagesLength.current;
    const shouldScrollToBottom = wasAtBottom.current && isNewMessage;
    
    if (shouldScrollToBottom) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    
    // Save current scroll position status
    wasAtBottom.current = checkIfAtBottom();
    prevMessagesLength.current = messages.length;
  }, [messages]);
  
  // Initial scroll to bottom
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [isLoading]);
  
  // Handle scroll event to detect when user scrolls to top
  const handleScroll = () => {
    if (!containerRef.current || !hasMoreMessages || isLoading) return;
    
    const { scrollTop } = containerRef.current;
    
    // If scrolled near the top, load more messages
    if (scrollTop < 50 && loadMoreMessages) {
      loadMoreMessages();
    }
    
    // Check if user is at the bottom
    const { scrollHeight, clientHeight } = containerRef.current;
    wasAtBottom.current = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
  };

  if (fetchError) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-red-500">
        <p>{fetchError}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="ghost" 
          className="mt-2"
        >
          Reload
        </Button>
      </div>
    );
  }
  
  return (
    <div 
      className="flex flex-col h-full overflow-y-auto p-4 space-y-4" 
      ref={containerRef}
      onScroll={handleScroll}
    >
      {hasMoreMessages && (
        <div className="flex justify-center py-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadMoreMessages}
            >
              Load more
            </Button>
          )}
        </div>
      )}
      
      {messages.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">Start a conversation</p>
        </div>
      ) : (
        messages.map((msg, index) => (
          <div
            key={msg.id || `msg-${index}`}
            className={cn(
              "flex", 
              msg.senderId === 'current' ? "justify-end" : "justify-start"
            )}
          >
            <div 
              className={cn(
                "max-w-[70%] px-4 py-2 rounded-lg break-words",
                msg.senderId === 'current' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <p>{msg.text || msg.content}</p>
              <p className="text-xs opacity-70 text-right mt-1">
                {typeof msg.timestamp === 'number' 
                  ? format(new Date(msg.timestamp), 'p') 
                  : format(new Date(msg.timestamp), 'p')}
              </p>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
