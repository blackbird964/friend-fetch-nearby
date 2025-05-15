
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import UserListHeader from './nearby-users/UserListHeader';
import EmptyUserList from './nearby-users/EmptyUserList';
import UsersList from './nearby-users/UsersList';
import { useUserActions } from './hooks/useUserActions';

const UserList: React.FC = () => {
  const { nearbyUsers, radiusInKm, currentUser, loading, refreshNearbyUsers } = useAppContext();
  const { startChat, handleAddFriend, handleRefresh, loading: actionLoading } = useUserActions();

  // Get only real users (filter out any test users if they somehow remain)
  const realUsers = nearbyUsers.filter(user => 
    // Filter out users that don't have a valid ID or have test/mock in their ID
    user.id && !String(user.id).includes('test') && !String(user.id).includes('mock')
  );

  console.log("UserList component - Displaying users:", realUsers);

  return (
    <div className="space-y-6">
      <UserListHeader 
        userCount={realUsers.length}
        radiusInKm={radiusInKm}
        loading={loading || actionLoading}
        onRefresh={handleRefresh}
      />
      
      {realUsers.length === 0 ? (
        <EmptyUserList hasLocation={!!currentUser?.location} />
      ) : (
        <UsersList 
          users={realUsers}
          onAddFriend={handleAddFriend}
          onStartChat={startChat}
        />
      )}
    </div>
  );
};

export default UserList;
