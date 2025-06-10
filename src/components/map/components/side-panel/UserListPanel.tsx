
import React from 'react';
import { AppUser } from '@/context/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserListItem from './UserListItem';

interface UserListPanelProps {
  users: AppUser[];
  currentUser: AppUser | null;
  radiusInKm: number;
  onUserSelect: (user: AppUser) => void;
}

const UserListPanel: React.FC<UserListPanelProps> = ({
  users,
  currentUser,
  radiusInKm,
  onUserSelect
}) => {
  const onlineUsers = users.filter(user => 
    user.id !== currentUser?.id && 
    user.isOnline === true &&
    user.id && 
    !String(user.id).includes('test') && 
    !String(user.id).includes('mock')
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">
          People Nearby
        </h3>
        <p className="text-sm text-gray-600">
          {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} within {radiusInKm}km
        </p>
      </div>

      {/* User List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {onlineUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No people nearby</p>
              <p className="text-xs mt-1">Try increasing your search radius</p>
            </div>
          ) : (
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  currentUser={currentUser}
                  onClick={() => onUserSelect(user)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserListPanel;
