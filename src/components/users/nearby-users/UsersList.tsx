
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
    console.log("[UsersList] User selected for details:", user.name);
    setSelectedUser(user);
  };
  
  const handleCloseDrawer = () => {
    setSelectedUser(null);
  };

  const handleStartChat = (user: AppUser) => {
    console.log("[UsersList] Starting chat with user:", user.name);
    onStartChat(user);
  };

  // RELAXED filtering: Show all users for now while presence system establishes itself
  const displayUsers = users.filter(user => {
    // Basic filtering - just exclude invalid users
    const hasValidId = user.id && !String(user.id).includes('test') && !String(user.id).includes('mock');
    console.log(`UsersList: User ${user.name} - hasValidId: ${hasValidId}, isOnline: ${user.isOnline}`);
    return hasValidId;
  });

  console.log(`UsersList: Showing ${displayUsers.length} users out of ${users.length} total users (relaxed filtering)`);

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {displayUsers.map((user) => (
          <UserItem 
            key={user.id} 
            user={user} 
            onStartChat={handleStartChat}
            onSelect={handleSelectUser}
          />
        ))}
      </div>
      
      <UserDetailsDrawer
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={handleCloseDrawer}
        onStartChat={handleStartChat}
      />
    </>
  );
};

export default UsersList;
