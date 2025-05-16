
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
  ProfileWithBlockedUsers
} from './profiles/types';

// For backward compatibility, export types - but no longer re-export Profile type with same name
import { ProfileWithBlockedUsers } from './profiles/types';
export type { ProfileWithBlockedUsers };

