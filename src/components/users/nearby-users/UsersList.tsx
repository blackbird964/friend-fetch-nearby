
import React from 'react';
import UserItem from './UserItem';
import { AppUser } from '@/context/types';

interface UsersListProps {
  users: AppUser[];
  onAddFriend: (user: AppUser) => void;
  onStartChat: (user: AppUser) => void;
}

const UsersList: React.FC<UsersListProps> = ({ users, onAddFriend, onStartChat }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {users.map((user) => (
        <UserItem 
          key={user.id} 
          user={user} 
          onAddFriend={onAddFriend} 
          onStartChat={onStartChat}
        />
      ))}
    </div>
  );
};

export default UsersList;
