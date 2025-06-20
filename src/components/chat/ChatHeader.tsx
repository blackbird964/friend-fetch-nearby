
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';

interface ChatHeaderProps {
  participantName: string;
  profilePic: string;
  onBack?: () => void;
  showBackButton: boolean;
  isOnline?: boolean;
  onSendFriendRequest?: () => void;
  isFriend?: boolean;
  participantId?: string;
  hasPendingRequest?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  participantName, 
  profilePic, 
  onBack, 
  showBackButton,
  isOnline = false,
  onSendFriendRequest,
  isFriend = false,
  participantId,
  hasPendingRequest = false
}) => {
  return (
    <div className="flex items-center p-3 border-b bg-background sticky top-0 z-10 shadow-sm">
      {showBackButton && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <UserAvatar 
        src={profilePic} 
        alt={participantName} 
        size="sm"
        showStatus
        isOnline={isOnline}
      />
      <div className="ml-3 flex-1">
        <h3 className="font-medium">{participantName}</h3>
        <p className="text-xs text-gray-500">
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
      
      {/* Friend Request Button - only show if not already friends, no pending request, and we have a participant ID */}
      {!isFriend && !hasPendingRequest && participantId && onSendFriendRequest && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-2" 
          onClick={onSendFriendRequest}
          title="Send friend request"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      )}
      
      {/* Show pending status if request was sent */}
      {!isFriend && hasPendingRequest && (
        <div className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Request Sent
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
