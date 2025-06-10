
import React from 'react';
import { X, Users } from 'lucide-react';
import { AppUser } from '@/context/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserListItem from '../side-panel/UserListItem';
import BusinessCountPanel from '../side-panel/BusinessCountPanel';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  currentUser: AppUser | null;
  radiusInKm: number;
  onUserSelect: (user: AppUser) => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
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

  const businessUsers: AppUser[] = [];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-50 
          transform transition-transform duration-300 ease-in-out
          shadow-2xl md:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              People Nearby
            </h3>
            <p className="text-sm text-gray-600">
              {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} within {radiusInKm}km
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* User List */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
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
                        onClick={() => {
                          onUserSelect(user);
                          onClose(); // Close drawer when user is selected
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Footer */}
          <div className="flex-shrink-0">
            <BusinessCountPanel 
              businessCount={businessUsers.length}
              radiusInKm={radiusInKm}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
