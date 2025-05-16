
import { Profile, ProfileWithBlockedUsers } from './types';

/**
 * Converts Postgres point type to location object
 */
export function parseLocationData(location: any): { lat: number; lng: number } | null {
  try {
    // Handle conversion from Postgres point type
    if (typeof location === 'string' && location.startsWith('(')) {
      const match = location.match(/\(([^,]+),([^)]+)\)/);
      if (match) {
        return {
          lng: parseFloat(match[1]),
          lat: parseFloat(match[2])
        };
      }
    } else if (typeof location === 'object') {
      // If the data is already in the correct format, make sure it has lat/lng
      if (location && ('lat' in location || 'lng' in location)) {
        return location as { lat: number; lng: number };
      }
    }
  } catch (e) {
    console.error('Error parsing location data:', e);
  }
  
  return null;
}

/**
 * Ensure interests is an array and handle blocked users mapping
 */
export function normalizeProfileData(data: any): ProfileWithBlockedUsers {
  // Ensure interests is always an array
  if (!data.interests) {
    data.interests = [];
  } else if (!Array.isArray(data.interests)) {
    // If interests is not an array, convert it to one
    data.interests = data.interests ? [String(data.interests)] : [];
  }
  
  // Map blocked_users from database to both properties for consistency
  if (data.blocked_users) {
    data.blockedUsers = [...data.blocked_users];
  } else {
    data.blocked_users = [];
    data.blockedUsers = [];
  }

  return data as ProfileWithBlockedUsers;
}
