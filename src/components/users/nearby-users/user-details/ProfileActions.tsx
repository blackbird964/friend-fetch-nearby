
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';
import { AppUser } from '@/context/types';

interface ProfileActionsProps {
  user?: AppUser;
  onStartChat?: (user: AppUser) => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ user, onStartChat }) => {
  const handleStartChat = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("[ProfileActions] Chat button clicked for user:", user?.name, "ID:", user?.id);
    
    if (!user) {
      console.error("[ProfileActions] No user provided");
      return;
    }
    
    if (!onStartChat) {
      console.error("[ProfileActions] No onStartChat handler provided");
      return;
    }
    
    try {
      console.log("[ProfileActions] Calling onStartChat handler with user:", user);
      await onStartChat(user);
      console.log("[ProfileActions] onStartChat completed");
    } catch (error) {
      console.error("[ProfileActions] Error in onStartChat:", error);
    }
  };
  
  return (
    <div className="flex gap-3 w-full">
      <Button 
        onClick={handleStartChat}
        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={!user || !onStartChat}
        type="button"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Chat
      </Button>
    </div>
  );
};

export default ProfileActions;
