
import { supabase } from '@/integrations/supabase/client';
import { updateUserLocation as updateLocation } from '@/lib/supabase';
import { formatLocationForStorage } from '@/utils/locationUtils';

/**
 * Update user location in Supabase and local state
 */
export const updateUserLocation = async (
  userId: string, 
  location: { lat: number, lng: number },
  options?: { hideExactLocation?: boolean }
) => {
  try {
    console.log("Updating user location in context:", userId, location);
    
    // Format the location data for PostgreSQL point type storage
    const formattedLocation = formatLocationForStorage(location);
    
    console.log("Formatted location for PostgreSQL:", formattedLocation);
    
    // Create the update payload
    const updateData: any = {
      location: formattedLocation
    };

    // If privacy setting is provided, update it
    if (options?.hideExactLocation !== undefined) {
      console.log("Updating privacy setting:", options.hideExactLocation);
      updateData.location_settings = {
        hide_exact_location: options.hideExactLocation
      };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select();
      
    if (error) {
      console.error("Error updating user location:", error);
      throw error;
    } else {
      console.log("Location successfully updated:", data);
    }
    
    return { data, error };
  } catch (error) {
    console.error("Error in updateUserLocation:", error);
    throw error;
  }
};

/**
 * Extract location from PostgreSQL point type
 */
export const extractLocationFromPgPoint = (pgPoint: unknown): { lat: number, lng: number } | undefined => {
  try {
    if (typeof pgPoint === 'string' && pgPoint.startsWith('(')) {
      const match = pgPoint.match(/\(([^,]+),([^)]+)\)/);
      if (match) {
        return {
          lng: parseFloat(match[1]),
          lat: parseFloat(match[2])
        };
      }
    } else if (typeof pgPoint === 'object' && pgPoint !== null) {
      const point = pgPoint as any;
      if (point.lat !== undefined && point.lng !== undefined) {
        return {
          lat: point.lat,
          lng: point.lng
        };
      }
    }
    return undefined;
  } catch (e) {
    console.error('Error parsing PG point:', e);
    return undefined;
  }
};
