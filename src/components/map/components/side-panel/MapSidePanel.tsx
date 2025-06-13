
import React from 'react';
import { AppUser } from '@/context/types';
import { useChatActions } from '@/components/users/hooks/useChatActions';
import UserListPanel from './UserListPanel';
import BusinessCountPanel from './BusinessCountPanel';

interface MapSidePanelProps {
  users: AppUser[];
  currentUser: AppUser | null;
  radiusInKm: number;
  onUserSelect: (user: AppUser) => void;
}

export const MapSidePanel: React.FC<MapSidePanelProps> = ({
  users,
  currentUser,
  radiusInKm,
  onUserSelect
}) => {
  const { startChat } = useChatActions();

  const handleStartChat = async (user: AppUser) => {
    console.log("[MapSidePanel] Starting chat with user:", user.name);
    try {
      await startChat(user);
    } catch (error) {
      console.error("[MapSidePanel] Error starting chat:", error);
    }
  };

  // Filter out current user from the list
  const filteredUsers = users.filter(user => 
    currentUser && user.id !== currentUser.id
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-hidden">
        <UserListPanel 
          users={filteredUsers}
          radiusInKm={radiusInKm}
          onUserSelect={onUserSelect}
          onStartChat={handleStartChat}
        />
      </div>
      <div className="border-t">
        <BusinessCountPanel />
      </div>
    </div>
  );
};
