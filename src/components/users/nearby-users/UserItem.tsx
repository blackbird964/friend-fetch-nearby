
import React from 'react';
import UserCard from '../UserCard';
import UserActions from './UserActions';
import { AppUser } from '@/context/types';

interface UserItemProps {
  user: AppUser;
  onAddFriend: (user: AppUser) => void;
  onStartChat: (user: AppUser) => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onAddFriend, onStartChat }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <UserCard user={user} />
      <UserActions 
        user={user} 
        hasLocation={!!user.location} 
        onAddFriend={() => onAddFriend(user)} 
        onStartChat={() => onStartChat(user)}
      />
    </div>
  );
};

export default UserItem;
