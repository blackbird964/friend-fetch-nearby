
import React, { useState } from 'react';
import UserItem from './UserItem';
import UserDetailsDrawer from './UserDetailsDrawer';
import { AppUser } from '@/context/types';

interface UsersListProps {
  users: AppUser[];
  onStartChat: (user: AppUser) => void;
}

const UsersList: React.FC<UsersListProps> = ({ users, onStartChat }) => {
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
            onStartChat={onStartChat}
            onSelect={handleSelectUser}
          />
        ))}
      </div>
      
      <UserDetailsDrawer
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={handleCloseDrawer}
        onStartChat={onStartChat}
      />
    </>
  );
};

export default UsersList;
