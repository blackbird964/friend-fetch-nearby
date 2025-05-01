
import React, { useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import useChat from '@/hooks/useChat';

const ChatWindow: React.FC = () => {
  const { selectedChat, setSelectedChat } = useAppContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  
  const { message, setMessage, isLoading, handleSendMessage } = useChat(selectedChat?.id || null);

  // Focus textarea when chat is selected
  useEffect(() => {
    if (selectedChat && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedChat]);

  if (!selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader 
        participantName={selectedChat.participantName}
        profilePic={selectedChat.profilePic}
        onBack={() => setSelectedChat(null)}
        showBackButton={isMobile}
      />
      
      <MessageList 
        messages={selectedChat.messages}
        isLoading={isLoading}
      />
      
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
