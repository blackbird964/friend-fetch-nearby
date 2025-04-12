
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import UserCard from './UserCard';

const UserList: React.FC = () => {
  const { nearbyUsers } = useAppContext();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">People Nearby</h2>
      
      {nearbyUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No users found nearby. Try increasing your radius.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nearbyUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
