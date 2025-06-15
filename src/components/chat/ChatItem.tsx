
import React from 'react';
import { Chat } from '@/context/types';
import { formatMessageTime } from '@/utils/dateFormatters';
import { CircleDot, Circle } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { formatMessageContent } from '@/hooks/chat/utils/messageFormatters';

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: (chat: Chat) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, isSelected, onSelect }) => {
  const hasUnreadMessages = (chat.unreadCount || 0) > 0;
  
  // Format the last message content to show user-friendly text
  const displayMessage = formatMessageContent(chat.lastMessage);
  
  return (
    <button
      className={`flex items-center w-full p-4 text-left transition-colors border-b last:border-b-0 ${
        isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(chat)}
    >
      <div className="relative">
        <UserAvatar 
          src={chat.profilePic} 
          alt={chat.participantName} 
          size="md"
          showStatus
          isOnline={chat.isOnline}
        />
        {hasUnreadMessages && (
          <div className="absolute -top-1 -right-1">
            <Badge className="h-5 w-5 flex items-center justify-center p-0 text-xs">
              {chat.unreadCount}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 ml-3">
        <div className="flex justify-between items-baseline">
          <h3 className={`font-medium truncate ${hasUnreadMessages ? 'font-bold' : ''}`}>
            {chat.participantName}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">
            {formatMessageTime(chat.lastMessageTime)}
          </span>
        </div>
        <p className={`text-sm text-gray-600 truncate ${hasUnreadMessages ? 'font-semibold' : ''}`}>
          {displayMessage}
        </p>
      </div>
    </button>
  );
};

export default ChatItem;
