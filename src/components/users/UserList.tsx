
import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import UsersList from './nearby-users/UsersList';
import UserListHeader from './nearby-users/UserListHeader';
import EmptyUserList from './nearby-users/EmptyUserList';
import UserRequestCard from '@/components/map/components/UserRequestCard';
import { useChatActions } from './hooks/useChatActions';
import { AppUser } from '@/context/types';

const UserList: React.FC = () => {
  const { currentUser, nearbyUsers } = useAppContext();
  const { startChat } = useChatActions();
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  // Filter users based on matching activities (same logic as MapPage)
  const filteredUsers = useMemo(() => {
    // Get only online and real users, excluding the current user
    let onlineUsers = nearbyUsers.filter(user => 
      // Exclude the current user first
      user.id !== currentUser?.id &&
      // Only include users marked as online
      user.isOnline === true &&
      // Filter out users that don't have a valid ID or have test/mock in their ID
      user.id && !String(user.id).includes('test') && !String(user.id).includes('mock')
    );

    // Filter users based on matching activities if current user has selected today's activities
    if (currentUser?.todayActivities && currentUser.todayActivities.length > 0) {
      onlineUsers = onlineUsers.filter(user => {
        // If the user doesn't have today's activities set, don't show them
        if (!user.todayActivities || user.todayActivities.length === 0) {
          return false;
        }
        
        // Check if there's at least one matching activity
        return user.todayActivities.some(activity => 
          currentUser.todayActivities!.includes(activity)
        );
      });
    }

    return onlineUsers;
  }, [nearbyUsers, currentUser]);

  const handleStartChat = async (user: AppUser) => {
    console.log("[UserList] Starting chat with user:", user.name);
    try {
      await startChat(user);
      setSelectedUser(null); // Close the card after starting chat
    } catch (error) {
      console.error("[UserList] Error starting chat:", error);
    }
  };

  const handleSelectUser = (user: AppUser) => {
    console.log("[UserList] User selected:", user.name);
    setSelectedUser(user);
  };

  const handleCloseCard = () => {
    console.log("[UserList] Closing user card");
    setSelectedUser(null);
  };

  return (
    <div className="space-y-4">
      <UserListHeader count={filteredUsers.length} />
      
      {filteredUsers.length === 0 ? (
        <EmptyUserList />
      ) : (
        <>
          <UsersList 
            users={filteredUsers} 
            onStartChat={handleSelectUser} // This will show the card instead of directly starting chat
            onSelect={handleSelectUser}
          />
          
          {/* Show UserRequestCard when a user is selected */}
          {selectedUser && (
            <UserRequestCard
              user={selectedUser}
              onClose={handleCloseCard}
            />
          )}
        </>
      )}
    </div>
  );
};

export default UserList;
