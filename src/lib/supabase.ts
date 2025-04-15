
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
  console.log("Fetching profile for user:", userId);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data as Profile;
}

export async function createOrUpdateProfile(profile: Partial<Profile> & { id: string }) {
  console.log("Creating/updating profile:", profile);
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single();
  
  return { data, error };
}
