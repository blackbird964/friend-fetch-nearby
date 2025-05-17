
/**
 * Profile data structure from the database
 */
export type Profile = {
  id: string;
  name: string | null;
  bio: string | null;
  age: number | null;
  gender: string | null;
  interests: string[];
  profile_pic: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  location?: {
    lat: number;
    lng: number;
  } | null;
  blocked_users?: string[];
  locationSettings?: {
    isManualMode?: boolean;
    hideExactLocation?: boolean;
  };
  location_settings?: {
    is_manual_mode?: boolean;
    hide_exact_location?: boolean;
  };
  is_over_18?: boolean;
  active_priorities?: ActivePriority[];
};

/**
 * Type for application use that adds the blockedUsers property for compatibility
 */
export type ProfileWithBlockedUsers = Profile & {
  blockedUsers?: string[];
};

/**
 * Active Priority data structure
 */
export type ActivePriority = {
  id: string;
  category: string;
  activity: string;
  frequency?: 'daily' | 'weekly' | 'weekends' | 'monthly' | undefined;
  timePreference?: 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible' | undefined;
  urgency?: 'now' | 'soon' | 'ongoing' | undefined;
  location?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | undefined;
};

/**
 * Priority category with associated activities
 */
export type PriorityCategory = {
  name: string;
  activities: string[];
};
