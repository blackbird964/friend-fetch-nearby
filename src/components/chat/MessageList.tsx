
import React, { useRef, useEffect, useState, memo } from 'react';
import { Message } from '@/context/types';
import { Loader2 } from 'lucide-react';
import { formatMessageTime } from '@/utils/dateFormatters';
import { useAppContext } from '@/context/AppContext';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  fetchError?: string | null;
}

// Memoized message item to prevent unnecessary re-renders
const MessageItem = memo(({ message }: { message: Message }) => {
  const { currentUser } = useAppContext();
  const isCurrentUser = message.senderId === currentUser?.id || message.senderId === 'current';
  const timestamp = typeof message.timestamp === 'string' ? parseInt(message.timestamp, 10) : message.timestamp;
  
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
              <p className="font-medium mb-1">
                {jsonData.status === 'accepted' 
                  ? 'Friend request accepted!' 
                  : 'You have a new friend request'
                }
              </p>
              {jsonData.duration && (
                <p className="text-sm">
                  {jsonData.duration} minute meetup with {jsonData.sender_name}
                </p>
              )}
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
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[75%] rounded-2xl p-3 
        ${isCurrentUser 
          ? 'bg-primary text-white rounded-tr-none' 
          : 'bg-gray-100 text-gray-800 rounded-tl-none'}
      `}>
        {renderMessageContent(message)}
        <p className={`text-xs mt-1 text-right ${
          isCurrentUser ? 'text-white/70' : 'text-gray-500'
        }`}>
          {formatMessageTime(timestamp)}
        </p>
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, fetchError }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const prevMessagesLength = useRef(messages.length);
  const hasScrolledToBottom = useRef(false);
  
  // Scroll to bottom when messages are first loaded or when new messages arrive
  useEffect(() => {
    const shouldScrollToBottom = 
      (!hasScrolledToBottom.current && messages.length > 0) || // First load
      (messages.length > prevMessagesLength.current && !userScrolled); // New messages
    
    if (shouldScrollToBottom) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: messages.length === prevMessagesLength.current ? 'smooth' : 'auto' });
        if (!hasScrolledToBottom.current) {
          hasScrolledToBottom.current = true;
        }
      }, 50);
      
      prevMessagesLength.current = messages.length;
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, userScrolled]);
  
  // Reset user scrolled state when sending a new message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && (lastMessage.senderId === 'current' || lastMessage.status === 'sending')) {
        setUserScrolled(false);
      }
    }
  }, [messages]);
  
  // Optimized scroll handler with throttling
  const handleScroll = useRef(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (e: React.UIEvent<HTMLDivElement>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const element = e.currentTarget;
          if (element) {
            const scrollPosition = element.scrollHeight - element.scrollTop - element.clientHeight;
            
            if (scrollPosition > 50) {
              setUserScrolled(true);
            } else if (scrollPosition < 10) {
              setUserScrolled(false);
            }
          }
        }, 100);
      };
    })()
  ).current;
  
  if (isLoading && messages.length === 0) {
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
  
  return (
    <div 
      className="h-full overflow-y-auto" 
      onScroll={handleScroll}
      ref={scrollContainerRef}
    >
      <div className="p-4 space-y-4 pb-6">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
};

export default memo(MessageList);
