
import { supabase } from '@/integrations/supabase/client';
import { formatLocationForStorage } from '@/utils/locationUtils';

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
  blockedUsers?: string[];
  locationSettings?: {
    isManualMode?: boolean;
    hideExactLocation?: boolean;
  };
  location_settings?: {
    is_manual_mode?: boolean;
    hide_exact_location?: boolean;
  };
  is_over_18?: boolean; // Added is_over_18 field
};

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
      // Handle conversion from Postgres point type
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
        // PostgreSQL stores point data as '(longitude,latitude)'
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
  
  // Handle location conversion for PostgreSQL
  let profileToUpsert = { ...profile };
  
  // If location exists, format it for PostgreSQL storage
  if (profile.location) {
    try {
      // Store location separately to handle proper PostgreSQL point format
      const locationObject = profile.location;
      delete profileToUpsert.location;
      
      // First update other fields
      const { error } = await supabase
        .from('profiles')
        .upsert(profileToUpsert)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating profile:', error);
        return { data: null, error };
      }
      
      // Then update location with proper format
      return await updateUserLocation(profile.id, locationObject);
    } catch (e) {
      console.error('Error converting location for storage:', e);
      delete profileToUpsert.location;
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
  
  // Ensure is_over_18 is included in the update
  if (profileToUpsert.is_over_18 === undefined) {
    profileToUpsert.is_over_18 = false;
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
  
  // Format location for PostgreSQL point type
  const formattedLocation = formatLocationForStorage(location);
  console.log("Formatted location:", formattedLocation);
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ location: formattedLocation })
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
}
