
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getUserFriendships, type Friendship } from '@/services/friendships';
import { getProfile } from '@/lib/supabase';
import { AppUser } from '@/context/types';

export function useFriendships() {
  const { currentUser } = useAppContext();
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [friends, setFriends] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      console.log("useFriendships: No current user, setting loading to false");
      setFriendships([]);
      setFriends([]);
      setIsLoading(false);
      return;
    }

    const fetchFriendships = async () => {
      try {
        setIsLoading(true);
        
        console.log("useFriendships: Fetching friendships for user:", currentUser.id);
        
        // Get all friendships for the current user
        const userFriendships = await getUserFriendships();
        console.log("useFriendships: Raw friendships from DB:", userFriendships);
        setFriendships(userFriendships);

        if (userFriendships.length === 0) {
          console.log("useFriendships: No friendships found");
          setFriends([]);
          setIsLoading(false);
          return;
        }

        // Fetch profile data for each friend
        console.log("useFriendships: Fetching profiles for", userFriendships.length, "friends");
        const friendProfiles = await Promise.all(
          userFriendships.map(async (friendship) => {
            try {
              console.log("useFriendships: Fetching profile for friend:", friendship.friend_id);
              const profile = await getProfile(friendship.friend_id);
              console.log("useFriendships: Profile data for", friendship.friend_id, ":", profile);
              
              if (profile) {
                const friendUser: AppUser = {
                  id: friendship.friend_id,
                  name: profile.name || 'Friend',
                  email: '', // Not stored in profiles table
                  interests: profile.interests || [],
                  profile_pic: profile.profile_pic,
                  isOnline: profile.is_online || false,
                  bio: profile.bio || null,
                  age: profile.age || null,
                  gender: profile.gender || null,
                  location: profile.location ? {
                    lat: profile.location.lat || 0,
                    lng: profile.location.lng || 0
                  } : null,
                  preferredHangoutDuration: profile.preferred_hangout_duration ? parseInt(profile.preferred_hangout_duration) : null,
                  todayActivities: [], // Default value since not in ProfileWithBlockedUsers
                  blockedUsers: [],
                  blocked_users: profile.blocked_users || []
                };
                
                console.log("useFriendships: Created friend user object:", friendUser);
                return friendUser;
              }
              return null;
            } catch (error) {
              console.error("useFriendships: Error fetching profile for friend:", friendship.friend_id, error);
              return null;
            }
          })
        );

        // Filter out null profiles and set friends
        const validFriends = friendProfiles.filter(Boolean) as AppUser[];
        console.log("useFriendships: Valid friends found:", validFriends.length);
        console.log("useFriendships: Friends data:", validFriends);
        setFriends(validFriends);
      } catch (error) {
        console.error('useFriendships: Error fetching friendships:', error);
        setFriends([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendships();
  }, [currentUser]);

  console.log("useFriendships: Returning - friends count:", friends.length, "isLoading:", isLoading);

  return {
    friendships,
    friends,
    isLoading,
    refetch: () => {
      if (currentUser) {
        console.log("useFriendships: Manual refetch triggered");
        setIsLoading(true);
      }
    }
  };
}
