
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

  // STRICT filtering: Only show users who are explicitly online (actively logged in)
  const onlineUsers = users.filter(user => {
    const isStrictlyOnline = user.isOnline === true;
    console.log(`UsersList: User ${user.name} isOnline: ${user.isOnline} (strictly online: ${isStrictlyOnline})`);
    return isStrictlyOnline;
  });

  console.log(`UsersList: Showing ${onlineUsers.length} ACTIVELY ONLINE users out of ${users.length} total users`);

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {onlineUsers.map((user) => (
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
