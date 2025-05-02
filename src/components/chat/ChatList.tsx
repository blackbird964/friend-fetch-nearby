
import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useChatList } from '@/hooks/useChatList';
import ChatItem from './ChatItem';
import ChatListLoader from './ChatListLoader';
import EmptyChatList from './EmptyChatList';

const ChatList: React.FC = () => {
  const { chats, selectedChat, setSelectedChat, setChats } = useAppContext();
  const { isLoading } = useChatList();

  // Simulate online status for demo purposes
  // In a real app, this would use something like Supabase Realtime for presence
  useEffect(() => {
    if (chats.length > 0) {
      // Generate random online statuses for demo
      const updatedChats = chats.map(chat => ({
        ...chat,
        isOnline: Math.random() > 0.5 // 50% chance of being online for demo
      }));
      setChats(updatedChats);
    }
  }, [chats.length]);

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
