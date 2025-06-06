
import React from 'react';
import UserCard from '../UserCard';
import UserActions from './UserActions';
import { AppUser } from '@/context/types';

interface UserItemProps {
  user: AppUser;
  onStartChat: (user: AppUser) => void;
  onSelect: (user: AppUser) => void;
}

const UserItem: React.FC<UserItemProps> = ({ 
  user, 
  onStartChat,
  onSelect
}) => {
  // Memoize the handlers to prevent unnecessary re-renders
  const handleStartChat = React.useCallback(() => {
    console.log("[UserItem] Starting chat with user:", user.name);
    onStartChat(user);
  }, [user, onStartChat]);
  
  const handleSelect = React.useCallback(() => {
    console.log("[UserItem] Selecting user:", user.name);
    onSelect(user);
  }, [user, onSelect]);
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <UserCard 
        user={user} 
        onClick={handleSelect}
      />
      <UserActions 
        user={user} 
        hasLocation={!!user.location} 
        onStartChat={handleStartChat}
      />
    </div>
  );
};

export default UserItem;
