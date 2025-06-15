
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
      setIsLoading(false);
      return;
    }

    const fetchFriendships = async () => {
      try {
        setIsLoading(true);
        
        console.log("Fetching friendships for user:", currentUser.id);
        
        // Get all friendships for the current user
        const userFriendships = await getUserFriendships();
        console.log("Found friendships:", userFriendships);
        setFriendships(userFriendships);

        // Fetch profile data for each friend
        const friendProfiles = await Promise.all(
          userFriendships.map(async (friendship) => {
            try {
              console.log("Fetching profile for friend:", friendship.friend_id);
              const profile = await getProfile(friendship.friend_id);
              console.log("Profile data:", profile);
              
              if (profile) {
                return {
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
                  preferredHangoutDuration: '30', // Default value since not in ProfileWithBlockedUsers
                  todayActivities: [], // Default value since not in ProfileWithBlockedUsers
                  blockedUsers: [],
                  blocked_users: profile.blocked_users || [],
                  friendshipDate: friendship.created_at
                } as AppUser & { friendshipDate: string };
              }
              return null;
            } catch (error) {
              console.error("Error fetching profile for friend:", friendship.friend_id, error);
              return null;
            }
          })
        );

        // Filter out null profiles and set friends
        const validFriends = friendProfiles.filter(Boolean) as (AppUser & { friendshipDate: string })[];
        console.log("Valid friends found:", validFriends);
        setFriends(validFriends);
      } catch (error) {
        console.error('Error fetching friendships:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendships();
  }, [currentUser]);

  return {
    friendships,
    friends,
    isLoading,
    refetch: () => {
      if (currentUser) {
        // Re-run the effect by updating a dependency (can be optimized later)
        setIsLoading(true);
      }
    }
  };
}
