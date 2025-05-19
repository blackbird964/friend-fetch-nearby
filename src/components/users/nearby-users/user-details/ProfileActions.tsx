
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';
import { AppUser } from '@/context/types';

interface ProfileActionsProps {
  onStartChat: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ onStartChat }) => {
  return (
    <div className="flex gap-3 w-full">
      <Button 
        onClick={onStartChat}
        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Chat
      </Button>
    </div>
  );
};

export default ProfileActions;
