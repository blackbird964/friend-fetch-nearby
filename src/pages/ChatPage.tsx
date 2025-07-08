
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';

const ChatPage: React.FC = () => {
  const { selectedChat } = useAppContext();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile View */}
        <div className="flex-1 flex flex-col md:hidden">
          {selectedChat ? (
            <ChatWindow />
          ) : (
            <div className="flex-1 flex flex-col p-2 overflow-hidden">
              <ChatSidebar />
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-1">
          {/* Left Sidebar */}
          <div className="w-80 border-r bg-white flex flex-col p-4">
            <ChatSidebar />
          </div>

          {/* Main Chat Area */}
          <div className="flex-1">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
