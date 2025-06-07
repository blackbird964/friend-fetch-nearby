
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

  // Get only online and real users, excluding the current user
  let onlineUsers = nearbyUsers.filter(user => 
    // Exclude the current user first
    user.id !== currentUser?.id &&
    // Only include users marked as online
    user.isOnline === true &&
    // Filter out users that don't have a valid ID or have test/mock in their ID
    user.id && !String(user.id).includes('test') && !String(user.id).includes('mock')
  );

  // Filter users based on matching activities if current user has selected today's activities
  if (currentUser?.todayActivities && currentUser.todayActivities.length > 0) {
    onlineUsers = onlineUsers.filter(user => {
      // If the user doesn't have today's activities set, don't show them
      if (!user.todayActivities || user.todayActivities.length === 0) {
        return false;
      }
      
      // Check if there's at least one matching activity
      return user.todayActivities.some(activity => 
        currentUser.todayActivities!.includes(activity)
      );
    });
  }

  console.log("UserList component - Current user ID:", currentUser?.id);
  console.log("UserList component - Current user activities:", currentUser?.todayActivities);
  console.log("UserList component - Displaying users:", onlineUsers.length, "out of", nearbyUsers.length);
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
          userCount={onlineUsers.length}
          radiusInKm={radiusInKm}
          loading={loading || chatLoading}
          onRefresh={handleRefresh}
        />
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {onlineUsers.length}
          </div>
          <p className="text-gray-600">
            {onlineUsers.length === 1 ? 'user' : 'users'} within {radiusInKm}km radius
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
        userCount={onlineUsers.length}
        radiusInKm={radiusInKm}
        loading={loading || chatLoading}
        onRefresh={handleRefresh}
      />
      
      {onlineUsers.length === 0 ? (
        <EmptyUserList hasLocation={!!currentUser?.location} />
      ) : (
        <UsersList 
          users={onlineUsers}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
};

export default UserList;
