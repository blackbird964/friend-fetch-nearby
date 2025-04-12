
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format, isToday, isYesterday } from 'date-fns';

const ChatList: React.FC = () => {
  const { chats, setSelectedChat, selectedChat } = useAppContext();

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
        <p>No chats yet</p>
        <p className="text-sm">Accept a friend request to start chatting</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {chats.map((chat) => (
        <button
          key={chat.id}
          className={`flex items-center w-full p-3 text-left transition-colors ${
            selectedChat?.id === chat.id
              ? 'bg-primary/10'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => setSelectedChat(chat)}
        >
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={chat.profilePic} alt={chat.participantName} />
            <AvatarFallback>{chat.participantName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium truncate">{chat.participantName}</h3>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {formatMessageTime(chat.lastMessageTime)}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatList;
