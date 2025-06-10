
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
  // Filter out business users for the business count
  // Note: AppUser doesn't have isBusiness property, so we'll check if they have business-related data
  const businessUsers = users.filter(user => {
    // Check if user has business-related properties or is marked as business in some way
    // For now, we'll assume all users are regular users since isBusiness doesn't exist in AppUser type
    return false; // Placeholder - will need business user detection logic
  });
  const regularUsers = users.filter(user => true); // All users are regular users for now

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
