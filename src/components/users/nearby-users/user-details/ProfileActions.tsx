
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';
import { AppUser } from '@/context/types';

interface ProfileActionsProps {
  user?: AppUser;
  onStartChat?: (user: AppUser) => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ user, onStartChat }) => {
  const handleStartChat = () => {
    if (user && onStartChat) {
      console.log("Starting chat with user:", user.name);
      onStartChat(user);
    } else {
      console.error("Cannot start chat: User or onStartChat handler is undefined");
    }
  };
  
  return (
    <div className="flex gap-3 w-full">
      <Button 
        onClick={handleStartChat}
        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={!user || !onStartChat}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Chat
      </Button>
    </div>
  );
};

export default ProfileActions;
