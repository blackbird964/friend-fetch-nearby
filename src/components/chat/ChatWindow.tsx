
import React, { useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import useChat from '@/hooks/useChat';
import { Loader2 } from 'lucide-react';

const ChatWindow: React.FC = () => {
  const { selectedChat, setSelectedChat } = useAppContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  
  const { message, setMessage, isLoading, fetchError, handleSendMessage } = useChat(selectedChat?.id || null);

  // Focus textarea when chat is selected and not loading
  useEffect(() => {
    if (selectedChat && textareaRef.current && !isLoading) {
      // Short delay to ensure UI is ready
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedChat, isLoading]);

  if (!selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <ChatHeader 
        participantName={selectedChat.participantName}
        profilePic={selectedChat.profilePic}
        onBack={() => setSelectedChat(null)}
        showBackButton={isMobile}
      />
      
      {isLoading && selectedChat.messages.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
            <p className="text-gray-500">Loading messages...</p>
          </div>
        </div>
      ) : (
        <MessageList 
          messages={selectedChat.messages}
          isLoading={isLoading}
          fetchError={fetchError}
        />
      )}
      
      <MessageInput 
        message={message}
        isLoading={isLoading}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
        textareaRef={textareaRef}
      />
    </div>
  );
};

export default ChatWindow;
