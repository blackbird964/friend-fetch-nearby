
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export async function signUp(email: string, password: string, name: string) {
  try {
    console.log("Making signup request to Supabase...");
    
    // Test connectivity first
    const { data: testConnection } = await supabase.auth.getSession();
    console.log("Supabase connectivity test successful");
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    console.log("Supabase signup response:", {
      user: !!data.user,
      session: !!data.session,
      error: !!error
    });
    
    return { data, error };
  } catch (error: any) {
    console.error("Network error during signup:", error);
    
    // Return a structured error for network issues
    return { 
      data: null, 
      error: {
        message: error.message || 'Failed to connect to authentication service',
        name: error.name,
        status: error.status || 'NETWORK_ERROR'
      }
    };
  }
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
