
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '@/lib/supabase';
import { AppUser } from '@/context/types';
import { DEFAULT_LOCATION } from '@/utils/locationUtils';
import { updateUserLocation } from '@/services/user';

/**
 * Fetch user profile and set default location if needed
 */
export async function fetchUserProfile(userId: string): Promise<AppUser | null> {
  try {
    const profile = await getProfile(userId);
    console.log("Profile fetched:", profile);
    
    if (profile) {
      const appUser = {
        ...profile,
        email: '',
      };
      
      // Set default location if none exists
      if (!profile.location) {
        const defaultLocation = DEFAULT_LOCATION;
        await updateUserLocation(profile.id, defaultLocation);
        appUser.location = defaultLocation;
      }
      
      return appUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Get current session from Supabase
 */
export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session;
}

/**
 * Set up auth state change listener
 */
export function setupAuthListener(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
