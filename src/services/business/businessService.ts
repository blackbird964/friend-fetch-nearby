
import { supabase } from '@/integrations/supabase/client';

export interface Business {
  id: string;
  auth_user_id: string;
  business_name: string;
  business_type: 'cafe' | 'bar' | 'restaurant' | 'lunch_spot' | 'other';
  description?: string;
  location?: { lat: number; lng: number };
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours_of_operation?: any;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export const updateBusinessProfile = async (userId: string, profileData: Partial<Business>) => {
  try {
    console.log("Updating business profile for user:", userId, profileData);
    
    const { data, error } = await supabase.rpc('update_business_profile', {
      user_id: userId,
      profile_data: profileData
    });
      
    if (error) {
      console.error('Error updating business profile:', error);
      throw error;
    }
    
    console.log('Business profile updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateBusinessProfile:', error);
    throw error;
  }
};

export const getBusinessProfile = async (userId: string): Promise<Business | null> => {
  try {
    const { data, error } = await supabase.rpc('get_business_profile', {
      user_id: userId
    });
      
    if (error) {
      if (error.message.includes('No business profile found')) {
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching business profile:', error);
    throw error;
  }
};

export const getNearbyBusinesses = async (
  location: { lat: number; lng: number }, 
  radiusKm: number
): Promise<Business[]> => {
  try {
    console.log(`Getting nearby businesses within ${radiusKm}km radius`);
    
    const { data: businesses, error } = await supabase.rpc('get_nearby_businesses', {
      lat: location.lat,
      lng: location.lng,
      radius_km: radiusKm
    });
      
    if (error) {
      console.error("Error fetching businesses:", error);
      throw error;
    }

    console.log("All fetched businesses:", businesses);
    
    // Filter businesses that have location data
    const businessesWithLocation = businesses?.filter((business: any) => business.location) || [];
    
    console.log(`Found ${businessesWithLocation.length} businesses with location data`);
    return businessesWithLocation;
  } catch (error) {
    console.error("Error getting nearby businesses:", error);
    return [];
  }
};

export const updateBusinessLocation = async (
  userId: string, 
  location: { lat: number; lng: number }
) => {
  try {
    console.log("Updating business location:", userId, location);
    
    const { data, error } = await supabase.rpc('update_business_location', {
      user_id: userId,
      lat: location.lat,
      lng: location.lng
    });
      
    if (error) {
      console.error("Error updating business location:", error);
      throw error;
    } else {
      console.log("Business location successfully updated:", data);
    }
    
    return { data, error };
  } catch (error) {
    console.error("Error in updateBusinessLocation:", error);
    throw error;
  }
};
