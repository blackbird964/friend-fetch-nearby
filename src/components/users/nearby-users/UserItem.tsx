
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
  // Updated to show card instead of directly starting chat
  const handleStartChat = React.useCallback(() => {
    console.log("[UserItem] Showing card for user:", user.name);
    onStartChat(user); // This will now show the card
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
        onStartChat={handleStartChat} // This will show the card
      />
    </div>
  );
};

export default UserItem;
