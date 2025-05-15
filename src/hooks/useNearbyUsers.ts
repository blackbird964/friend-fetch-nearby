
import { useState, useRef } from 'react';
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
  const PAGE_SIZE = 20; // Limit the number of users fetched at once

  /**
   * Refresh nearby users list with optimized data fetching
   * @param showToast Whether to show a toast notification (default: false)
   */
  const refreshNearbyUsers = async (showToast: boolean = false) => {
    if (!currentUser) return;

    try {
      // Throttle refreshes even more aggressively on mobile - wait at least 10 seconds
      const now = Date.now();
      const throttleTime = isMobile ? 10000 : 5000;
      
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
      
      // Only fetch required fields to reduce data transfer
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name, location, profile_pic, interests, is_online, bio, gender, age')
        .neq('id', currentUser.id)
        .order('is_online', { ascending: false })
        .limit(PAGE_SIZE);
      
      if (error) {
        throw error;
      }
      
      console.log("Fetched profiles:", profiles);
      
      // Convert to AppUser type with minimal data
      const otherUsers = profiles.map(profile => ({
        id: profile.id,
        name: profile.name || '',
        email: '', // We don't need emails for other users
        interests: Array.isArray(profile.interests) ? profile.interests : [],
        location: profile.location ? parseLocationFromPostgres(profile.location) : null,
        profile_pic: profile.profile_pic || null,
        bio: profile.bio || null,
        gender: profile.gender || null,
        age: profile.age || null,
        isOnline: profile.is_online || false
      }));

      console.log("Other users:", otherUsers);
      
      // Calculate distance for each user
      const usersWithDistance = processNearbyUsers(otherUsers, userLocation);
      console.log("Users with distance calculation:", usersWithDistance);
      
      // Set all users, including those without location
      setNearbyUsers(usersWithDistance);
      
      // If there are no users with location data, we could add some test users
      if (usersWithDistance.every(user => !user.location || user.distance === Infinity)) {
        const testUsers = await addTestUsersNearby(currentUser.id, userLocation);
        console.log("Added test users:", testUsers);
        
        // For testing only: simulate adding these users with location data
        if (testUsers.length > 0 && process.env.NODE_ENV === 'development') {
          // Only show test users in dev mode
          setNearbyUsers([...usersWithDistance, ...testUsers]);
        }
      }
      
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

  return { nearbyUsers, setNearbyUsers, loading, refreshNearbyUsers, lastFetchTime };
};
