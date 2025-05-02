
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import UserListHeader from './nearby-users/UserListHeader';
import EmptyUserList from './nearby-users/EmptyUserList';
import UsersList from './nearby-users/UsersList';
import { useUserActions } from './hooks/useUserActions';

const UserList: React.FC = () => {
  const { nearbyUsers, radiusInKm, currentUser, loading } = useAppContext();
  const { startChat, handleAddFriend, handleRefresh, loading: actionLoading } = useUserActions();

  return (
    <div className="space-y-6">
      <UserListHeader 
        userCount={nearbyUsers.length}
        radiusInKm={radiusInKm}
        loading={loading || actionLoading}
        onRefresh={handleRefresh}
      />
      
      {nearbyUsers.length === 0 ? (
        <EmptyUserList hasLocation={!!currentUser?.location} />
      ) : (
        <UsersList 
          users={nearbyUsers}
          onAddFriend={handleAddFriend}
          onStartChat={startChat}
        />
      )}
    </div>
  );
};

export default UserList;
