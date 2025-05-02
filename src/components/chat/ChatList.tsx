
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { useChatList } from '@/hooks/useChatList';
import ChatItem from './ChatItem';
import ChatListLoader from './ChatListLoader';
import EmptyChatList from './EmptyChatList';
import { useUserPresence } from '@/hooks/useUserPresence';

const ChatList: React.FC = () => {
  const { chats, selectedChat, setSelectedChat } = useAppContext();
  const { isLoading } = useChatList();
  
  // Use the user presence hook to subscribe to real-time status updates
  useUserPresence();

  if (isLoading) {
    return <ChatListLoader />;
  }

  if (chats.length === 0) {
    return <EmptyChatList />;
  }

  return (
    <div className="h-full overflow-y-auto">
      {chats.map((chat) => (
        <ChatItem 
          key={chat.id} 
          chat={chat} 
          isSelected={selectedChat?.id === chat.id}
          onSelect={setSelectedChat}
        />
      ))}
    </div>
  );
};

export default ChatList;
