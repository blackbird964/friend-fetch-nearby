
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
        
        // Get all friendships for the current user
        const userFriendships = await getUserFriendships();
        setFriendships(userFriendships);

        // Fetch profile data for each friend
        const friendProfiles = await Promise.all(
          userFriendships.map(async (friendship) => {
            const profile = await getProfile(friendship.friend_id);
            if (profile) {
              return {
                id: friendship.friend_id,
                name: profile.name || '',
                email: '',
                interests: profile.interests || [],
                profile_pic: profile.profile_pic,
                isOnline: profile.is_online || false,
                friendshipDate: friendship.created_at
              } as AppUser & { friendshipDate: string };
            }
            return null;
          })
        );

        // Filter out null profiles and set friends
        const validFriends = friendProfiles.filter(Boolean) as (AppUser & { friendshipDate: string })[];
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
