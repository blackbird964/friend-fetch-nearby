
// This file is kept for backward compatibility
// It re-exports all functionality from the new modular structure
export {
  updateUserLocation,
  updateUserProfile,
  addTestUsersNearby,
  processNearbyUsers,
  filterUsersByDistance,
  getNearbyUsers,
  extractLocationFromPgPoint
} from '@/services/user';
