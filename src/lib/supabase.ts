
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export { supabase };

export type Profile = {
  id: string;
  name: string;
  bio: string | null;
  age: number | null;
  gender: string | null;
  interests: string[];
  profile_pic: string | null;
};

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error || !data) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data as Profile;
}

export async function createOrUpdateProfile(profile: Partial<Profile> & { id: string }) {
  console.log("Profile data being sent to Supabase:", profile);
  
  try {
    // Get the current session first to ensure we're authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return { 
        data: null, 
        error: new Error('Not authenticated. Please log in again.') 
      };
    }
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking profile existence:', checkError);
      return { data: null, error: checkError };
    }
    
    // If profile doesn't exist, create it
    if (!existingProfile) {
      console.log('Profile does not exist, creating new profile:', profile);
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();
      
      return { data, error };
    }
    
    // If profile exists, update it
    console.log('Profile exists, updating profile:', profile);
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', profile.id)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Unexpected error in createOrUpdateProfile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}

export async function updateProfile(profile: Partial<Profile> & { id: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', profile.id)
    .select()
    .single();
  
  return { data, error };
}
