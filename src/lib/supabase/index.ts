
import { supabase } from '@/integrations/supabase/client';

// Re-export supabase client
export { supabase };

// Re-export auth functions
export {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getSession
} from './auth';

// Re-export profile types and functions
export {
  type Profile,
  type ProfileWithBlockedUsers,
  getProfile,
  getAllProfiles,
  createOrUpdateProfile,
  updateUserLocation
} from './profiles';

// Re-export business profile types and functions
export {
  type BusinessProfile,
  createBusinessProfile,
  getBusinessProfile,
  updateBusinessProfile
} from './businessProfiles';

// Re-export message types and functions
export {
  type Message,
  sendMessage,
  getConversation,
  markMessagesAsRead
} from './messages';
