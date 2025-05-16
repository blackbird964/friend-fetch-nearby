
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, UserPlus } from 'lucide-react';
import { AppUser } from '@/context/types';

interface ProfileActionsProps {
  onStartChat: () => void;
  onAddFriend: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ onStartChat, onAddFriend }) => {
  return (
    <div className="flex gap-3 w-full">
      <Button 
        onClick={onStartChat}
        variant="outline" 
        className="flex-1"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Chat
      </Button>
      <Button 
        onClick={onAddFriend}
        className="flex-1"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Add Friend
      </Button>
    </div>
  );
};

export default ProfileActions;
