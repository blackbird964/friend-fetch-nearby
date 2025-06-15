
import { Json } from '@/integrations/supabase/types';

export interface ActivePriority {
  id: string;
  category: string;
  activity: string;
  frequency?: string;
  timePreference?: string;
  urgency?: string;
  location?: string;
  experienceLevel?: string;
}

export interface PriorityCategory {
  name: string;
  activities: string[];
}

// Update LocationSettings to make all properties required
export interface LocationSettings {
  isManualMode: boolean;
  hideExactLocation: boolean;
}

export interface Profile {
  id: string;
  name: string | null;
  bio: string | null;
  age: number | null;
  gender: string | null;
  profile_pic: string | null;
  location: { lat: number, lng: number } | null;
  last_seen: string | null;
  is_online: boolean | null;
  is_over_18: boolean | null;
  interests: string[] | null;
  active_priorities: ActivePriority[] | null;
  email_notifications_enabled?: boolean | null;
  location_settings?: {
    is_manual_mode?: boolean;
    hide_exact_location?: boolean;
  };
  // For frontend compatibility
  locationSettings?: LocationSettings;
}

export interface ProfileWithBlockedUsers extends Profile {
  blocked_users: string[];
  blockedUsers: string[];
}
