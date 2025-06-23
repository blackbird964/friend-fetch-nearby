
import React, { useEffect, useState } from 'react';
import { AppUser } from '@/context/types';
import { useChatActions } from '@/components/users/hooks/useChatActions';
import UserListPanel from './UserListPanel';
import BusinessCountPanel from './BusinessCountPanel';
import { getBusinessProfile, isLikelyBusinessName } from '@/lib/supabase/businessProfiles';

interface MapSidePanelProps {
  users: AppUser[];
  currentUser: AppUser | null;
  radiusInKm: number;
  onUserSelect: (user: AppUser) => void;
}

const MapSidePanel: React.FC<MapSidePanelProps> = ({
  users,
  currentUser,
  radiusInKm,
  onUserSelect
}) => {
  const { startChat } = useChatActions();
  const [businessCount, setBusinessCount] = useState(0);

  // Count businesses among the users
  useEffect(() => {
    const countBusinesses = async () => {
      let count = 0;
      
      for (const user of users) {
        // Skip current user
        if (currentUser && user.id === currentUser.id) {
          continue;
        }
        
        try {
          // Check if user has a business profile
          const businessProfile = await getBusinessProfile(user.id);
          if (businessProfile) {
            count++;
            console.log(`Found business profile for: ${businessProfile.business_name}`);
            continue;
          }
          
          // Fallback: check if name suggests business
          if (user.name && isLikelyBusinessName(user.name)) {
            count++;
            console.log(`Found likely business by name: ${user.name}`);
          }
        } catch (error) {
          console.warn(`Error checking business status for ${user.id}:`, error);
          
          // Still check name as fallback
          if (user.name && isLikelyBusinessName(user.name)) {
            count++;
            console.log(`Found likely business by name (fallback): ${user.name}`);
          }
        }
      }
      
      console.log(`Total businesses found: ${count}`);
      setBusinessCount(count);
    };
    
    countBusinesses();
  }, [users, currentUser]);

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
        <BusinessCountPanel 
          businessCount={businessCount}
          radiusInKm={radiusInKm}
        />
      </div>
    </div>
  );
};

export default MapSidePanel;
