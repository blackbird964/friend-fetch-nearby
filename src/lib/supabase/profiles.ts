
// This file is a wrapper for backward compatibility
// It re-exports all profile-related functionality from the new module structure

export { 
  getProfile, 
  getAllProfiles, 
  createOrUpdateProfile, 
  updateUserLocation 
} from './profiles/queries';

export { 
  parseLocationData, 
  normalizeProfileData 
} from './profiles/utils';

export type { 
  Profile,
  ProfileWithBlockedUsers,
  ActivePriority
} from './profiles/types';
