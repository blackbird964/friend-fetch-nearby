
import { Profile, ProfileWithBlockedUsers } from './types';
import { Json } from '@/integrations/supabase/types';

/**
 * Parse the location data from Postgres point type to our location format
 */
export function parseLocationData(location: any): { lat: number, lng: number } | null {
  if (!location) return null;
  
  try {
    // Handle string format "(lat,lng)"
    if (typeof location === 'string') {
      const match = location.match(/\(([^,]+),([^)]+)\)/);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        };
      }
    }
    
    // Handle object format with x,y coordinates (from Postgres)
    if (typeof location === 'object' && 'x' in location && 'y' in location) {
      return {
        lat: location.y,
        lng: location.x
      };
    }
    
    // Handle already correctly formatted object
    if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
      return {
        lat: location.lat,
        lng: location.lng
      };
    }
    
    console.error('Unknown location format:', location);
    return null;
  } catch (e) {
    console.error('Error parsing location data:', e);
    return null;
  }
}

/**
 * Normalize profile data for application use, converting JSON fields, etc.
 */
export function normalizeProfileData(profile: any): ProfileWithBlockedUsers {
  // Create a copy of the profile to avoid mutation
  const normalizedProfile = { ...profile };
  
  // Convert the blocked_users to blockedUsers for compatibility
  if (normalizedProfile.blocked_users && !normalizedProfile.blockedUsers) {
    normalizedProfile.blockedUsers = [...normalizedProfile.blocked_users];
  }
  
  // Ensure blocked_users always exists
  if (!normalizedProfile.blocked_users) {
    normalizedProfile.blocked_users = [];
  }
  
  // Ensure blockedUsers always exists
  if (!normalizedProfile.blockedUsers) {
    normalizedProfile.blockedUsers = [];
  }
  
  // Convert active_priorities from JSON to proper type if needed
  if (normalizedProfile.active_priorities) {
    normalizedProfile.active_priorities = convertJsonToActivePriorities(normalizedProfile.active_priorities);
  } else {
    normalizedProfile.active_priorities = [];
  }
  
  // Ensure location_settings and locationSettings are properly set
  if (normalizedProfile.location_settings && !normalizedProfile.locationSettings) {
    normalizedProfile.locationSettings = {
      isManualMode: normalizedProfile.location_settings.is_manual_mode,
      hideExactLocation: normalizedProfile.location_settings.hide_exact_location
    };
  }
  
  return normalizedProfile as ProfileWithBlockedUsers;
}

/**
 * Helper function to convert Json type to ActivePriority[]
 */
function convertJsonToActivePriorities(jsonData: Json | null): any[] {
  if (!jsonData) return [];
  
  // If it's already an array, map it to ensure it has the correct structure
  if (Array.isArray(jsonData)) {
    return jsonData.map(item => {
      // Handle each item safely with type checking
      const priority: any = {};
      
      if (item && typeof item === 'object') {
        // Only add properties that exist
        if ('id' in item && typeof item.id === 'string') {
          priority.id = item.id;
        }
        
        if ('category' in item && typeof item.category === 'string') {
          priority.category = item.category;
        }
        
        if ('activity' in item && typeof item.activity === 'string') {
          priority.activity = item.activity;
        }
        
        if ('frequency' in item) {
          priority.frequency = item.frequency;
        }
        
        if ('timePreference' in item) {
          priority.timePreference = item.timePreference;
        }
        
        if ('urgency' in item) {
          priority.urgency = item.urgency;
        }
        
        if ('location' in item && typeof item.location === 'string') {
          priority.location = item.location;
        }
        
        if ('experienceLevel' in item) {
          priority.experienceLevel = item.experienceLevel;
        }
      }
      
      return priority;
    }).filter(item => item.id && item.activity); // Filter out any invalid items
  }
  
  return [];
}
