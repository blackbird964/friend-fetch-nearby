
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';

interface ChatHeaderProps {
  participantName: string;
  profilePic: string;
  onBack?: () => void;
  showBackButton: boolean;
  isOnline?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  participantName, 
  profilePic, 
  onBack, 
  showBackButton,
  isOnline = false
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
      <div className="ml-3">
        <h3 className="font-medium">{participantName}</h3>
        <p className="text-xs text-gray-500">
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;
