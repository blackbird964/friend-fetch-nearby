
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export { supabase };

export type Profile = {
  id: string;
  name: string;
  bio: string | null;
  age: number | null;
  gender: string | null;
  interests: string[];
  profile_pic: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  location?: {
    lat: number;
    lng: number;
  } | null;
};

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  console.log("Fetching profile for user:", userId);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  // Convert Postgres point type to our location format if it exists
  if (data && data.location) {
    try {
      // Handle conversion from Postgres point type if needed
      if (typeof data.location === 'string' && data.location.startsWith('(')) {
        const match = data.location.match(/\(([^,]+),([^)]+)\)/);
        if (match) {
          data.location = {
            lng: parseFloat(match[1]),
            lat: parseFloat(match[2])
          };
        }
      } else if (typeof data.location === 'object') {
        // If the data is already in the correct format, make sure it has lat/lng
        if (data.location && !('lat' in data.location || 'lng' in data.location)) {
          data.location = null;
        }
      }
    } catch (e) {
      console.error('Error parsing location data:', e);
      data.location = null;
    }
  }
  
  // Ensure interests is always an array
  if (data) {
    if (!data.interests) {
      data.interests = [];
    } else if (!Array.isArray(data.interests)) {
      // If interests is not an array, convert it to one
      data.interests = data.interests ? [String(data.interests)] : [];
    }
  }
  
  return data as Profile;
}

export async function getAllProfiles(): Promise<Profile[]> {
  console.log("Fetching all profiles");
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  
  // Process each profile to ensure location data is properly formatted
  return data.map(profile => {
    // Convert Postgres point type to our location format if it exists
    if (profile.location) {
      try {
        if (typeof profile.location === 'string' && profile.location.startsWith('(')) {
          const match = profile.location.match(/\(([^,]+),([^)]+)\)/);
          if (match) {
            profile.location = {
              lng: parseFloat(match[1]),
              lat: parseFloat(match[2])
            };
          }
        } else if (typeof profile.location === 'object') {
          // If the data is already in the correct format, make sure it has lat/lng
          if (profile.location && !('lat' in profile.location || 'lng' in profile.location)) {
            profile.location = null;
          }
        }
      } catch (e) {
        console.error('Error parsing location data for profile:', profile.id, e);
        profile.location = null;
      }
    }
    
    // Ensure interests is always an array
    if (!Array.isArray(profile.interests)) {
      profile.interests = profile.interests ? [String(profile.interests)] : [];
    }
    
    return profile as Profile;
  });
}

export async function createOrUpdateProfile(profile: Partial<Profile> & { id: string }) {
  console.log("Creating/updating profile:", profile);
  
  // Handle location conversion for PostgreSQL if needed
  let profileToUpsert = { ...profile };
  
  // If we have location data in our format, convert it for PostgreSQL storage
  if (profile.location && typeof profile.location === 'object') {
    try {
      // Your conversion logic here if needed
      // For now, we'll keep it as is since we modified the Profile type
    } catch (e) {
      console.error('Error converting location for storage:', e);
      profileToUpsert.location = null;
    }
  }

  // Ensure interests is an array before saving
  if (profileToUpsert.interests) {
    if (!Array.isArray(profileToUpsert.interests)) {
      profileToUpsert.interests = [String(profileToUpsert.interests)];
    }
  } else {
    profileToUpsert.interests = [];
  }
  
  console.log("Final profile data being sent to Supabase:", profileToUpsert);
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileToUpsert)
    .select()
    .single();
  
  return { data, error };
}

export async function updateUserLocation(userId: string, location: { lat: number, lng: number }) {
  console.log("Updating location for user:", userId, location);
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ location })
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
}
