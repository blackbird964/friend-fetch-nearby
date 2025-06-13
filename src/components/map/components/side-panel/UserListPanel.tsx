
import React from 'react';
import { AppUser } from '@/context/types';
import UserListItem from './UserListItem';

interface UserListPanelProps {
  users: AppUser[];
  radiusInKm: number;
  onUserSelect: (user: AppUser) => void;
  onStartChat: (user: AppUser) => void;
}

const UserListPanel: React.FC<UserListPanelProps> = ({
  users,
  radiusInKm,
  onUserSelect,
  onStartChat
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold">
          Nearby Users ({users.length})
        </h2>
        <p className="text-sm text-gray-600">
          Within {radiusInKm}km radius
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No users found within {radiusInKm}km</p>
            <p className="text-sm mt-1">Try increasing your search radius</p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {users.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                onSelect={onUserSelect}
                onStartChat={onStartChat}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListPanel;
