
import React, { useState } from 'react';
import UserItem from './UserItem';
import UserDetailsDrawer from './UserDetailsDrawer';
import { AppUser } from '@/context/types';

interface UsersListProps {
  users: AppUser[];
  onAddFriend: (user: AppUser) => void;
  onStartChat: (user: AppUser) => void;
}

const UsersList: React.FC<UsersListProps> = ({ users, onAddFriend, onStartChat }) => {
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  
  const handleSelectUser = (user: AppUser) => {
    setSelectedUser(user);
  };
  
  const handleCloseDrawer = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => (
          <UserItem 
            key={user.id} 
            user={user} 
            onAddFriend={onAddFriend} 
            onStartChat={onStartChat}
            onSelect={handleSelectUser}
          />
        ))}
      </div>
      
      <UserDetailsDrawer
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={handleCloseDrawer}
        onAddFriend={onAddFriend}
        onStartChat={onStartChat}
      />
    </>
  );
};

export default UsersList;
