
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/supabase';
import { updateUserLocation } from './userLocationService';
import { Json } from '@/integrations/supabase/types';

/**
 * Update user profile in Supabase
 */
export const updateUserProfile = async (updatedProfile: Partial<Profile>) => {
  try {
    if (!updatedProfile.id) {
      throw new Error('Profile ID is missing');
    }
    
    // Create a copy of the profile data without location
    const profileUpdate = { ...updatedProfile } as any;
    
    // Remove location from update to avoid format errors
    delete profileUpdate.location;
    
    // Handle location settings - transform from camelCase to snake_case
    if (profileUpdate.locationSettings) {
      profileUpdate.location_settings = {
        is_manual_mode: profileUpdate.locationSettings.isManualMode,
        hide_exact_location: profileUpdate.locationSettings.hideExactLocation
      };
      delete profileUpdate.locationSettings;
    }
    
    // Handle direct location_settings update - ensure all required fields are present
    if (profileUpdate.location_settings) {
      console.log("Updating location settings:", profileUpdate.location_settings);
      
      // Ensure both required fields are present
      if (profileUpdate.location_settings.is_manual_mode === undefined) {
        profileUpdate.location_settings.is_manual_mode = false;
      }
      
      if (profileUpdate.location_settings.hide_exact_location === undefined) {
        profileUpdate.location_settings.hide_exact_location = false;
      }
    }

    // Handle today's activities - now that we have the field in the database
    if (profileUpdate.todayActivities !== undefined) {
      profileUpdate.today_activities = profileUpdate.todayActivities;
      delete profileUpdate.todayActivities;
    }

    // Handle preferred hangout duration
    if (profileUpdate.preferredHangoutDuration !== undefined) {
      profileUpdate.preferred_hangout_duration = profileUpdate.preferredHangoutDuration;
      delete profileUpdate.preferredHangoutDuration;
    }
    
    // Make sure active_priorities is valid and converted to JSON before sending it to Supabase
    if (profileUpdate.active_priorities) {
      // Ensure it's a proper array
      if (!Array.isArray(profileUpdate.active_priorities)) {
        profileUpdate.active_priorities = [];
      }
      
      // Validate each priority item has the required fields
      profileUpdate.active_priorities = profileUpdate.active_priorities.filter(priority => 
        priority && priority.id && priority.activity
      ).map(priority => ({
        id: priority.id,
        category: priority.category || "Sydney Activities",
        activity: priority.activity,
        // Only include optional fields if they exist
        ...(priority.frequency ? { frequency: priority.frequency } : {}),
        ...(priority.timePreference ? { timePreference: priority.timePreference } : {}),
        ...(priority.urgency ? { urgency: priority.urgency } : {}),
        ...(priority.location ? { location: priority.location } : {}),
        ...(priority.experienceLevel ? { experienceLevel: priority.experienceLevel } : {})
      }));
      
      console.log("Formatted active_priorities for storage:", profileUpdate.active_priorities);
      
      // Convert active_priorities to JSON string for Supabase
      profileUpdate.active_priorities = JSON.stringify(profileUpdate.active_priorities);
    }
    
    // Log the profile update being sent to Supabase
    console.log("Sending profile update to Supabase:", profileUpdate);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', updatedProfile.id)
      .select();
      
    if (error) {
      console.error('Supabase error updating user profile:', error);
      throw error;
    }

    console.log("Profile update response:", data);
    
    // If location is provided, update it separately with the correct format
    if (updatedProfile.location) {
      await updateUserLocation(updatedProfile.id, updatedProfile.location);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
