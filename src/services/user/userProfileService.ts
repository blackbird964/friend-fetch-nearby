
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/supabase';
import { updateUserLocation } from './userLocationService';

/**
 * Update user profile in Supabase
 */
export const updateUserProfile = async (updatedProfile: Partial<Profile>) => {
  try {
    if (!updatedProfile.id) {
      throw new Error('Profile ID is missing');
    }
    
    // Create a copy of the profile data without location
    const profileUpdate = { ...updatedProfile };
    
    // Remove location from update to avoid format errors
    delete profileUpdate.location;
    
    // Handle location settings - transform from camelCase to snake_case
    if (profileUpdate.locationSettings) {
      profileUpdate.location_settings = {
        is_manual_mode: profileUpdate.locationSettings.isManualMode
      };
      delete profileUpdate.locationSettings;
    }
    
    // Handle direct location_settings update
    if (profileUpdate.location_settings) {
      // Make sure it's already in the right format
      console.log("Updating location settings:", profileUpdate.location_settings);
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', updatedProfile.id);
      
    if (error) {
      throw error;
    }
    
    // If location is provided, update it separately with the correct format
    if (updatedProfile.location) {
      await updateUserLocation(updatedProfile.id, updatedProfile.location);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
