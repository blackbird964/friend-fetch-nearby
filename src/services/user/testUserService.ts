
import { createTestUsers } from '@/utils/locationUtils';
import { AppUser } from '@/context/types';

/**
 * Add test users nearby the current user for development purposes
 */
export const addTestUsersNearby = async (currentUserId: string, currentLocation: { lat: number, lng: number }) => {
  try {
    // Create test users near the current user's location
    const testUsers = createTestUsers(currentLocation, 5);
    
    console.log("Generated test users:", testUsers);
    
    // In a real app, we would save these users to the database
    // For now, just return them
    return testUsers;
  } catch (error) {
    console.error("Error adding test users:", error);
    return [];
  }
};
