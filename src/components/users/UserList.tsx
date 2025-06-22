
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import UserListHeader from './nearby-users/UserListHeader';
import EmptyUserList from './nearby-users/EmptyUserList';
import UsersList from './nearby-users/UsersList';
import { useChatActions } from './hooks/useChatActions';
import { getBusinessProfile } from '@/lib/supabase/businessProfiles';

const UserList: React.FC = () => {
  const { nearbyUsers, radiusInKm, currentUser, loading, refreshNearbyUsers } = useAppContext();
  const { startChat, loading: chatLoading } = useChatActions();
  const [isBusinessUser, setIsBusinessUser] = React.useState<boolean | null>(null);

  // Check if current user is a business user
  React.useEffect(() => {
    const checkBusinessUser = async () => {
      if (currentUser) {
        try {
          const businessProfile = await getBusinessProfile(currentUser.id);
          setIsBusinessUser(!!businessProfile);
        } catch (error) {
          console.error('Error checking business profile:', error);
          setIsBusinessUser(false);
        }
      }
    };
    
    checkBusinessUser();
  }, [currentUser]);

  const handleRefresh = async () => {
    try {
      console.log("UserList - Refreshing nearby users with latest data");
      await refreshNearbyUsers(true);
    } catch (error) {
      console.error("Error refreshing users:", error);
    }
  };

  // RELAXED filtering: Show all valid users while presence system establishes itself
  let displayUsers = nearbyUsers.filter(user => 
    // Exclude the current user first
    user.id !== currentUser?.id &&
    // Filter out users that don't have a valid ID or have test/mock in their ID
    user.id && !String(user.id).includes('test') && !String(user.id).includes('mock')
  );

  console.log("UserList component - All nearby users:", nearbyUsers.length);
  console.log("UserList component - Display users (relaxed filtering):", displayUsers.length);
  console.log("UserList component - Display user details:", displayUsers.map(u => ({ 
    id: u.id, 
    name: u.name, 
    isOnline: u.isOnline,
    activities: u.todayActivities,
    interests: u.interests
  })));

  console.log("UserList component - Current user activities:", currentUser?.todayActivities);
  console.log("UserList component - Current user interests:", currentUser?.interests);
  console.log("UserList component - Is business user:", isBusinessUser);

  const handleStartChat = (user: any) => {
    console.log("[UserList] Starting chat with user:", user.name);
    startChat(user);
  };

  // If business user, show only count
  if (isBusinessUser) {
    return (
      <div className="space-y-6">
        <UserListHeader 
          userCount={displayUsers.length}
          radiusInKm={radiusInKm}
          loading={loading || chatLoading}
          onRefresh={handleRefresh}
        />
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {displayUsers.length}
          </div>
          <p className="text-gray-600">
            {displayUsers.length === 1 ? 'user' : 'users'} within {radiusInKm}km radius
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Business accounts can see user count only
          </p>
        </div>
      </div>
    );
  }

  // Regular user view - show full list
  return (
    <div className="space-y-6">
      <UserListHeader 
        userCount={displayUsers.length}
        radiusInKm={radiusInKm}
        loading={loading || chatLoading}
        onRefresh={handleRefresh}
      />
      
      {displayUsers.length === 0 ? (
        <EmptyUserList hasLocation={!!currentUser?.location} />
      ) : (
        <UsersList 
          users={displayUsers}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
};

export default UserList;
