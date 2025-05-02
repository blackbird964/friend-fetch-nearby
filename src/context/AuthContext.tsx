
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { getProfile } from '@/lib/supabase';
import { AppUser, Location } from './types';
import { updateUserLocation as updateLocation, updateUserProfile as updateProfile } from './userService';
import { DEFAULT_LOCATION } from '@/utils/locationUtils';
import { AuthContextType } from './AppContextTypes';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Wrapper for the user location and profile update functions to match expected types
  const updateUserLocation = async (userId: string, location: Location): Promise<void> => {
    await updateLocation(userId, location);
  };
  
  const updateUserProfile = async (userId: string, profileData: Partial<AppUser>): Promise<void> => {
    await updateProfile({ ...profileData, id: userId });
  };

  // Auth state listener
  useEffect(() => {
    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setLoading(true);
        
        if (session?.user) {
          setSupabaseUser(session.user);
          setIsAuthenticated(true);
          
          // Use setTimeout to prevent deadlocks
          setTimeout(async () => {
            try {
              const profile = await getProfile(session.user.id);
              console.log("Profile fetched after auth change:", profile);
              
              if (profile) {
                const appUser = {
                  ...profile,
                  email: session.user.email || '',
                };
                setCurrentUser(appUser);
                
                // Set default location if none exists
                if (!profile.location) {
                  const defaultLocation = DEFAULT_LOCATION;
                  await updateUserLocation(profile.id, defaultLocation);
                  appUser.location = defaultLocation;
                  setCurrentUser(appUser);
                }
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setSupabaseUser(null);
          setIsAuthenticated(false);
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      console.log("Initial session check:", data.session);
      
      if (data.session?.user) {
        setSupabaseUser(data.session.user);
        setIsAuthenticated(true);
        
        const profile = await getProfile(data.session.user.id);
        console.log("Initial profile:", profile);
        
        if (profile) {
          const appUser = {
            ...profile,
            email: data.session.user.email || '',
          };
          setCurrentUser(appUser);
          
          // Set default location if none exists
          if (!profile.location) {
            const defaultLocation = DEFAULT_LOCATION;
            await updateUserLocation(profile.id, defaultLocation);
            appUser.location = defaultLocation;
            setCurrentUser(appUser);
          }
        }
      }
      
      setLoading(false);
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        setCurrentUser,
        supabaseUser,
        setSupabaseUser,
        loading,
        updateUserLocation,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
