
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import UserListHeader from './nearby-users/UserListHeader';
import EmptyUserList from './nearby-users/EmptyUserList';
import UsersList from './nearby-users/UsersList';
import { useUserActions } from './hooks/useUserActions';

const UserList: React.FC = () => {
  const { nearbyUsers, radiusInKm, currentUser, loading, refreshNearbyUsers } = useAppContext();
  const { startChat, handleAddFriend, handleRefresh, loading: actionLoading } = useUserActions();

  // Get only online and real users (filter out any test users if they somehow remain)
  const onlineUsers = nearbyUsers.filter(user => 
    // Only include users marked as online
    user.isOnline === true &&
    // Filter out users that don't have a valid ID or have test/mock in their ID
    user.id && !String(user.id).includes('test') && !String(user.id).includes('mock')
  );

  console.log("UserList component - Displaying users:", onlineUsers.length, "out of", nearbyUsers.length);

  return (
    <div className="space-y-6">
      <UserListHeader 
        userCount={onlineUsers.length}
        radiusInKm={radiusInKm}
        loading={loading || actionLoading}
        onRefresh={handleRefresh}
      />
      
      {onlineUsers.length === 0 ? (
        <EmptyUserList hasLocation={!!currentUser?.location} />
      ) : (
        <UsersList 
          users={onlineUsers}
          onAddFriend={handleAddFriend}
          onStartChat={startChat}
        />
      )}
    </div>
  );
};

export default UserList;
