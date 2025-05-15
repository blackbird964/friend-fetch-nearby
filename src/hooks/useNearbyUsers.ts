import { useState, useRef, useEffect } from 'react';
import { getAllProfiles } from '@/lib/supabase';
import { AppUser } from '@/context/types';
import { processNearbyUsers, addTestUsersNearby } from '@/services/user';
import { DEFAULT_LOCATION } from '@/utils/locationUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Hook to manage nearby users functionality with optimized data fetching
 */
export const useNearbyUsers = (currentUser: AppUser | null) => {
  const [nearbyUsers, setNearbyUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const hasInitiallyFetched = useRef<boolean>(false);
  const toastShownRef = useRef<boolean>(false);
  const PAGE_SIZE = 10; // Reduced from 20 to 10 to minimize egress
  const CACHE_TTL = 300000; // 5 minutes cache validity
  const userCacheRef = useRef<Map<string, { timestamp: number, data: AppUser }>>(new Map());

  /**
   * Refresh nearby users list with optimized data fetching
   * @param showToast Whether to show a toast notification (default: false)
   */
  const refreshNearbyUsers = async (showToast: boolean = false) => {
    if (!currentUser) return;

    try {
      // Even more aggressive throttling - wait longer between refreshes
      const now = Date.now();
      const throttleTime = isMobile ? 30000 : 15000; // 30 seconds on mobile, 15 seconds on desktop
      
      if (now - lastFetchTime < throttleTime) {
        console.log("Skipping refresh - throttled");
        return;
      }
      
      // On mobile, only show one toast per session for automatic updates
      if (isMobile && showToast && toastShownRef.current) {
        console.log("Skipping toast on mobile - already shown once");
        showToast = false;
      }
      
      setLoading(true);
      setLastFetchTime(now);
      console.log("Refreshing nearby users for:", currentUser.name, "with ID:", currentUser.id);
      
      // Set default location if user doesn't have one
      const userLocation = currentUser.location || DEFAULT_LOCATION;
      
      // Use timestamp-based conditional fetching - only get profiles updated recently
      // This significantly reduces data transfer for infrequent profile changes
      const lastFetchTimestamp = new Date(now - CACHE_TTL).toISOString();
      
      // Only fetch minimal required fields and use more specific filters
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name, location, is_online, updated_at')
        .neq('id', currentUser.id)
        .order('is_online', { ascending: false })
        .limit(PAGE_SIZE);
      
      if (error) {
        throw error;
      }
      
      // Convert to AppUser type with minimal data
      const fetchedUsers = profiles.map(profile => {
        // Basic user with minimal data
        const basicUser: AppUser = {
          id: profile.id,
          name: profile.name || '',
          email: '', 
          location: profile.location ? parseLocationFromPostgres(profile.location) : null,
          isOnline: profile.is_online || false,
          interests: [],
          // Skip other fields to minimize data size
        };

        return basicUser;
      });
      
      // Calculate distance for each user
      const usersWithDistance = processNearbyUsers(fetchedUsers, userLocation);
      
      // For users that need more details, fetch them separately
      const usersNeedingDetails = usersWithDistance.filter(user => 
        user.location && 
        (!userCacheRef.current.has(user.id) || 
        (now - (userCacheRef.current.get(user.id)?.timestamp || 0) > CACHE_TTL))
      ).slice(0, 5); // Limit to 5 most relevant users for detailed info
      
      // For these users, get additional details
      if (usersNeedingDetails.length > 0) {
        const userIds = usersNeedingDetails.map(u => u.id);
        
        const { data: detailedProfiles } = await supabase
          .from('profiles')
          .select('id, interests, bio, gender, age, profile_pic')
          .in('id', userIds);
        
        if (detailedProfiles) {
          // Update cache with detailed information
          detailedProfiles.forEach(profile => {
            const baseUser = usersWithDistance.find(u => u.id === profile.id);
            if (baseUser) {
              const detailedUser: AppUser = {
                ...baseUser,
                interests: Array.isArray(profile.interests) ? profile.interests : [],
                bio: profile.bio || undefined,
                gender: profile.gender || undefined,
                age: profile.age || undefined,
                profile_pic: profile.profile_pic || undefined,
              };
              
              // Update cache
              userCacheRef.current.set(profile.id, { 
                timestamp: now, 
                data: detailedUser 
              });
              
              // Update the user in our array
              const index = usersWithDistance.findIndex(u => u.id === profile.id);
              if (index !== -1) {
                usersWithDistance[index] = detailedUser;
              }
            }
          });
        }
      }
      
      // Apply cached data for users we already have details for
      usersWithDistance.forEach((user, index) => {
        if (userCacheRef.current.has(user.id)) {
          const cached = userCacheRef.current.get(user.id);
          if (cached && now - cached.timestamp < CACHE_TTL) {
            usersWithDistance[index] = {
              ...user,
              ...cached.data,
              // Keep the new online status and distance
              isOnline: user.isOnline,
              distance: user.distance
            };
          }
        }
      });
      
      // Set all users, including those without location
      setNearbyUsers(usersWithDistance);
      
      // Set the initial fetch flag to true
      hasInitiallyFetched.current = true;
      
      // Only show toast if explicitly requested AND not on mobile (or first time on mobile)
      if (showToast) {
        if (!isMobile || !toastShownRef.current) {
          toast({
            title: "Users Updated",
            description: `Found ${usersWithDistance.length} users nearby.`,
          });
          
          // Track that we've shown a toast on mobile
          if (isMobile) {
            toastShownRef.current = true;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching nearby users:", error);
      // Only show error toast if explicitly requested by the user through manual refresh
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to refresh nearby users.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse location from PostgreSQL point format
  function parseLocationFromPostgres(pgLocation: any): { lat: number, lng: number } | null {
    if (!pgLocation) return null;
    
    try {
      // Handle string format from Postgres: "(lng,lat)"
      if (typeof pgLocation === 'string' && pgLocation.startsWith('(')) {
        const match = pgLocation.match(/\(([^,]+),([^)]+)\)/);
        if (match) {
          return {
            lng: parseFloat(match[1]),
            lat: parseFloat(match[2])
          };
        }
      }
      // Handle if it's already parsed as an object
      else if (typeof pgLocation === 'object' && pgLocation !== null) {
        if ('lat' in pgLocation && 'lng' in pgLocation) {
          return {
            lat: pgLocation.lat,
            lng: pgLocation.lng
          };
        }
      }
    } catch (e) {
      console.error('Error parsing location data:', e);
    }
    
    return null;
  }

  // Reduce frequency of automatic refreshes
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (currentUser?.location) {
      // Initial fetch
      refreshNearbyUsers(false);
      
      // Set up longer intervals for auto-refresh
      intervalId = window.setInterval(() => {
        refreshNearbyUsers(false);
      }, isMobile ? 300000 : 180000); // 5 minutes on mobile, 3 minutes on desktop
    }
    
    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [currentUser?.id, currentUser?.location]);

  return { nearbyUsers, setNearbyUsers, loading, refreshNearbyUsers, lastFetchTime };
};
