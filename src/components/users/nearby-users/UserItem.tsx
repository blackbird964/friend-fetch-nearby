
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
  return (
    <div className="border rounded-lg overflow-hidden">
      <UserCard 
        user={user} 
        onClick={() => onSelect(user)}
      />
      <UserActions 
        user={user} 
        hasLocation={!!user.location} 
        onStartChat={() => {
          console.log("UserItem: Starting chat with user:", user.name);
          onStartChat(user);
        }}
      />
    </div>
  );
};

export default UserItem;
