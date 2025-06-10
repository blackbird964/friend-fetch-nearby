
import React from 'react';
import { AppUser } from '@/context/types';
import UserListPanel from './UserListPanel';
import BusinessCountPanel from './BusinessCountPanel';

interface MapSidePanelProps {
  users: AppUser[];
  currentUser: AppUser | null;
  radiusInKm: number;
  onUserSelect: (user: AppUser) => void;
  className?: string;
}

const MapSidePanel: React.FC<MapSidePanelProps> = ({
  users,
  currentUser,
  radiusInKm,
  onUserSelect,
  className = ""
}) => {
  // For now, we don't have business user detection logic
  // All users are treated as regular users
  const businessUsers: AppUser[] = [];
  const regularUsers = users;

  return (
    <div className={`flex flex-col h-full bg-white border-l border-gray-200 ${className}`}>
      {/* User List Section - Takes most of the space */}
      <div className="flex-1 min-h-0">
        <UserListPanel 
          users={regularUsers}
          currentUser={currentUser}
          radiusInKm={radiusInKm}
          onUserSelect={onUserSelect}
        />
      </div>
      
      {/* Business Count Section - Fixed height at bottom */}
      <div className="flex-shrink-0">
        <BusinessCountPanel 
          businessCount={businessUsers.length}
          radiusInKm={radiusInKm}
        />
      </div>
    </div>
  );
};

export default MapSidePanel;
