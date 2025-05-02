
import React, { useRef, useEffect } from 'react';
import { Message } from '@/context/types';
import { Loader2 } from 'lucide-react';
import { formatMessageTime } from '@/utils/dateFormatters';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4 flex-grow">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center py-4 flex-grow">
        <p className="text-gray-500">No messages yet. Say hello!</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((msg) => {
        const isCurrentUser = msg.senderId === 'current';
        
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
              <p className="break-words">{msg.text}</p>
              <p className={`text-xs mt-1 text-right ${
                isCurrentUser ? 'text-white/70' : 'text-gray-500'
              }`}>
                {formatMessageTime(msg.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
