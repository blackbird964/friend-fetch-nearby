
import { ProfileWithBlockedUsers } from './types';

/**
 * Parse location data from various formats
 */
export const parseLocationData = (location: any): { lat: number, lng: number } | null => {
  if (!location) return null;
  
  // Handle PostgreSQL point format: "(lat,lng)" or "POINT(lng lat)"
  if (typeof location === 'string') {
    // Handle POINT(lng lat) format
    const pointMatch = location.match(/POINT\(([^)]+)\)/);
    if (pointMatch) {
      const coords = pointMatch[1].split(' ');
      return {
        lng: parseFloat(coords[0]),
        lat: parseFloat(coords[1])
      };
    }
    
    // Handle (lat,lng) format
    const coordMatch = location.match(/\(([^,]+),([^)]+)\)/);
    if (coordMatch) {
      return {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2])
      };
    }
  }
  
  // Handle object format
  if (typeof location === 'object' && location.lat !== undefined && location.lng !== undefined) {
    return {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng)
    };
  }
  
  console.warn('Unknown location format:', location);
  return null;
};

/**
 * Normalize profile data to ensure consistent structure
 */
export const normalizeProfileData = (profile: any): ProfileWithBlockedUsers => {
  // Parse active_priorities if it's a string
  let activePriorities = [];
  if (profile.active_priorities) {
    if (typeof profile.active_priorities === 'string') {
      try {
        activePriorities = JSON.parse(profile.active_priorities);
      } catch (e) {
        console.warn('Failed to parse active_priorities:', e);
      }
    } else if (Array.isArray(profile.active_priorities)) {
      activePriorities = profile.active_priorities;
    }
  }

  return {
    ...profile,
    active_priorities: activePriorities,
    blocked_users: profile.blocked_users || [],
    blockedUsers: profile.blocked_users || [],
    // Handle today's activities from database
    todayActivities: profile.today_activities || [],
    preferredHangoutDuration: profile.preferred_hangout_duration || '30',
    // Ensure interests is always an array
    interests: Array.isArray(profile.interests) ? profile.interests : []
  };
};
