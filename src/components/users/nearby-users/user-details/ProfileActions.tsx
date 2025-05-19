
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';
import { AppUser } from '@/context/types';
import { useChatActions } from '@/components/users/hooks/useChatActions';

interface ProfileActionsProps {
  user?: AppUser; // Making user optional but will get it from parent context
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ user }) => {
  const { startChat } = useChatActions();
  
  const handleStartChat = () => {
    if (user) {
      console.log("Starting chat with user:", user.name);
      startChat(user);
    } else {
      console.error("Cannot start chat: User is undefined");
    }
  };
  
  return (
    <div className="flex gap-3 w-full">
      <Button 
        onClick={handleStartChat}
        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Chat
      </Button>
    </div>
  );
};

export default ProfileActions;
