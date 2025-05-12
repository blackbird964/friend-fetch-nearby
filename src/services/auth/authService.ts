
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AppUser, Location } from '@/context/types';

/**
 * Sets up the auth state change listener
 */
export const setupAuthListener = (
  callback: (event: string, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth state change event:", event);
    callback(event, session);
  });
};

/**
 * Gets the current session
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data } = await supabase.auth.getSession();
  return data?.session;
};

/**
 * Fetches the user profile based on the auth id
 */
export const fetchUserProfile = async (userId: string): Promise<AppUser | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!profile) {
      console.log('No profile found for user:', userId);
      return null;
    }

    return {
      id: profile.id,
      name: profile.name || '',
      bio: profile.bio || '',
      age: profile.age || null,
      gender: profile.gender || '',
      interests: Array.isArray(profile.interests) ? profile.interests : [],
      profile_pic: profile.profile_pic || null,
      email: '', // Email will be added from session
      location: profile.location ? profile.location as Location : undefined,
      is_over_18: profile.is_over_18 || false,
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};
