
import React, { useRef, useEffect } from 'react';
import { Message } from '@/context/types';
import { Loader2 } from 'lucide-react';
import { formatMessageTime } from '@/utils/dateFormatters';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  fetchError?: string | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, fetchError }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      // Use a short delay to ensure rendering is complete
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages, isLoading]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4 h-full">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }
  
  if (fetchError) {
    return (
      <div className="flex justify-center items-center py-4 h-full">
        <div className="flex flex-col items-center">
          <p className="text-red-500 mb-2">{fetchError}</p>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }
  
  if (!messages || messages.length === 0) {
    return (
      <div className="flex justify-center items-center py-4 h-full">
        <p className="text-gray-500">No messages yet. Say hello!</p>
      </div>
    );
  }
  
  const renderMessageContent = (message: Message) => {
    const messageText = message.text || message.content || '';
    
    // Try to parse as JSON if the message appears to be JSON data
    try {
      if (messageText && (messageText.startsWith('{') || messageText.startsWith('['))) {
        const jsonData = JSON.parse(messageText);
        
        // Handle friend request
        if (jsonData.type === 'friend_request') {
          return (
            <div className="bg-primary-50 p-3 rounded-md border border-primary-100">
              <p className="font-medium mb-1">Friend Request {jsonData.status === 'accepted' ? '(Accepted)' : ''}</p>
              <p className="text-sm">
                {jsonData.duration} minute meetup with {jsonData.sender_name}
              </p>
            </div>
          );
        }
        
        // For other types of JSON data, just display it nicely formatted
        return <p className="break-words">{JSON.stringify(jsonData, null, 2)}</p>;
      }
    } catch (error) {
      // Not valid JSON, treat as regular text
    }
    
    // Default rendering for regular text messages
    return <p className="break-words">{messageText}</p>;
  };
  
  return (
    <div className="h-full w-full overflow-hidden">
      <ScrollArea className="h-full w-full pr-4">
        <div className="p-4 space-y-4 pb-2">
          {messages.map((msg) => {
            const isCurrentUser = msg.senderId === 'current';
            // Convert timestamp to number if it's a string
            const timestamp = typeof msg.timestamp === 'string' ? parseInt(msg.timestamp, 10) : msg.timestamp;
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[75%] rounded-2xl p-3 
                  ${isCurrentUser 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'}
                `}>
                  {renderMessageContent(msg)}
                  <p className={`text-xs mt-1 text-right ${
                    isCurrentUser ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
