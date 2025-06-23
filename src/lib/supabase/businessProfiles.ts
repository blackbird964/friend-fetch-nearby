
import { supabase } from '@/integrations/supabase/client';

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  contact_person: string;
  phone?: string;
  address?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export async function createBusinessProfile(profile: {
  user_id: string;
  business_name: string;
  contact_person: string;
  phone?: string;
  address?: string;
  description?: string;
}) {
  console.log("Creating business profile:", profile);
  
  const { data, error } = await supabase
    .from('business_profiles')
    .insert(profile)
    .select()
    .single();
  
  return { data, error };
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  console.log("Fetching business profile for user:", userId);
  
  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching business profile:', error);
      return null;
    }
    
    console.log(`Business profile result for ${userId}:`, data);
    return data;
  } catch (err) {
    console.error('Exception fetching business profile:', err);
    return null;
  }
}

export async function updateBusinessProfile(userId: string, updates: Partial<Omit<BusinessProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
  console.log("Updating business profile for user:", userId, updates);
  
  const { data, error } = await supabase
    .from('business_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  return { data, error };
}

// Helper function to check if a user name suggests they are a business
export function isLikelyBusinessName(userName: string): boolean {
  const businessIndicators = [
    'coffee', 'cafe', 'restaurant', 'shop', 'store', 'company', 'corp', 
    'ltd', 'llc', 'inc', 'bakery', 'bar', 'grill', 'pizza', 'market',
    'cookies', 'handover', 'kiki\'s', 'kitchen', 'bistro', 'deli'
  ];
  
  const lowerName = userName.toLowerCase();
  return businessIndicators.some(indicator => lowerName.includes(indicator));
}
