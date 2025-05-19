
import { supabase } from '@/integrations/supabase/client';
import { Profile, ProfileWithBlockedUsers } from './types';
import { parseLocationData, normalizeProfileData } from './utils';
import { formatLocationForStorage } from '@/utils/locationUtils';
import { Json } from '@/integrations/supabase/types';

/**
 * Fetch a single profile by user ID
 */
export async function getProfile(userId: string): Promise<ProfileWithBlockedUsers | null> {
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
  
  if (!data) return null;
  
  // Convert Postgres point type to our location format if it exists
  if (data.location) {
    data.location = parseLocationData(data.location);
  }
  
  return normalizeProfileData(data);
}

/**
 * Fetch all profiles
 */
export async function getAllProfiles(): Promise<ProfileWithBlockedUsers[]> {
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
      profile.location = parseLocationData(profile.location);
    }
    
    return normalizeProfileData(profile);
  });
}

/**
 * Create or update a profile
 */
export async function createOrUpdateProfile(profile: Partial<ProfileWithBlockedUsers> & { id: string }) {
  console.log("Creating/updating profile:", profile);
  
  // Handle location conversion for PostgreSQL
  let profileToUpsert = { ...profile } as any;
  
  // Map blockedUsers to blocked_users for database storage
  if (profile.blockedUsers) {
    profileToUpsert.blocked_users = [...profile.blockedUsers];
    delete profileToUpsert.blockedUsers;
  }
  
  // Convert active_priorities to Json for database storage
  if (profileToUpsert.active_priorities) {
    profileToUpsert.active_priorities = JSON.stringify(profileToUpsert.active_priorities);
  }
  
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

/**
 * Update a user's location
 */
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
