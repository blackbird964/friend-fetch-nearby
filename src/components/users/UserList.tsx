
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
    // CRITICAL: Only include users who are actually online (logged into platform)
    user.isOnline === true &&
    // Filter out users that don't have a valid ID or have test/mock in their ID
    user.id && !String(user.id).includes('test') && !String(user.id).includes('mock')
  );

  console.log("UserList component - All nearby users:", nearbyUsers.length);
  console.log("UserList component - Online users:", onlineUsers.length);
  console.log("UserList component - Online user details:", onlineUsers.map(u => ({ 
    id: u.id, 
    name: u.name, 
    isOnline: u.isOnline 
  })));

  // Filter users based on matching activities OR interests
  if (currentUser) {
    const beforeFilter = onlineUsers.length;
    
    // First try to match by activities if current user has them
    if (currentUser.todayActivities && currentUser.todayActivities.length > 0) {
      const activityMatches = onlineUsers.filter(user => {
        // If the user has today's activities, check for matches
        if (user.todayActivities && user.todayActivities.length > 0) {
          return user.todayActivities.some(activity => 
            currentUser.todayActivities!.includes(activity)
          );
        }
        return false;
      });
      
      console.log(`UserList component - Activity matches: ${activityMatches.length}`);
      
      if (activityMatches.length > 0) {
        onlineUsers = activityMatches;
      } else {
        // If no activity matches, fall back to interest matching
        if (currentUser.interests && currentUser.interests.length > 0) {
          onlineUsers = onlineUsers.filter(user => {
            if (!user.interests || user.interests.length === 0) {
              return false;
            }
            return user.interests.some(interest => 
              currentUser.interests!.includes(interest)
            );
          });
          console.log(`UserList component - Interest matches (fallback): ${onlineUsers.length}`);
        }
      }
    } else {
      // If current user has no activities, match by interests
      if (currentUser.interests && currentUser.interests.length > 0) {
        onlineUsers = onlineUsers.filter(user => {
          if (!user.interests || user.interests.length === 0) {
            return false;
          }
          return user.interests.some(interest => 
            currentUser.interests!.includes(interest)
          );
        });
        console.log(`UserList component - Interest matches (primary): ${onlineUsers.length}`);
      }
    }
    
    console.log(`UserList component - After filtering: ${onlineUsers.length} (was ${beforeFilter})`);
  }

  console.log("UserList component - Current user ID:", currentUser?.id);
  console.log("UserList component - Current user activities:", currentUser?.todayActivities);
  console.log("UserList component - Current user interests:", currentUser?.interests);
  console.log("UserList component - Final displaying users:", onlineUsers.length);
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
            {onlineUsers.length === 1 ? 'user' : 'users'} online within {radiusInKm}km radius
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
