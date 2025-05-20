
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, MapPin } from 'lucide-react';
import { AppUser } from '@/context/types';
import { useChatActions } from '@/components/users/hooks/useChatActions';

interface UserActionsProps {
  user: AppUser;
  hasLocation: boolean;
  onStartChat: () => void;
}

const UserActions: React.FC<UserActionsProps> = ({ 
  user, 
  hasLocation, 
  onStartChat 
}) => {
  const handleChatClick = () => {
    console.log("UserActions: Chat button clicked for user:", user.name);
    onStartChat();
  };
  
  return (
    <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
      {!hasLocation && (
        <div className="text-xs text-amber-600 flex items-center gap-1 mb-1">
          <MapPin className="h-3 w-3" />
          <span>User hasn't shared their location yet</span>
        </div>
      )}
      <div className="flex w-full">
        <Button 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
          onClick={handleChatClick}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
        </Button>
      </div>
    </div>
  );
};

export default UserActions;
