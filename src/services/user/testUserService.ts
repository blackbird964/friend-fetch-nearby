
import { AppUser } from '@/context/types';

/**
 * Add test users nearby the current user for development purposes
 */
export const addTestUsersNearby = async (currentUserId: string, currentLocation: { lat: number, lng: number }) => {
  try {
    // Return empty array instead of creating test users
    console.log("Test user creation disabled");
    return [];
  } catch (error) {
    console.error("Error adding test users:", error);
    return [];
  }
};

