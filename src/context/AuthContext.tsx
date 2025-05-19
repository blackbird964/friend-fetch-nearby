
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AppUser } from './types';
import { AuthContextType } from './AppContextTypes';
import { useUserActions } from '@/hooks/useUserActions';
import { useUserProfile } from '@/hooks/useUserProfile';
import { fetchUserProfile, getCurrentSession, setupAuthListener } from '@/services/auth/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Use the profile and actions hooks
  const { updateUserLocation, updateUserProfile: profileUpdateFunction } = useUserProfile();
  const { blockUser, unblockUser, reportUser, loading: actionsLoading } = useUserActions(currentUser, setCurrentUser);

  // Adapt the updateUserProfile function to match our context type
  const updateUserProfile = async (profileData: Partial<AppUser>) => {
    return await profileUpdateFunction(profileData);
  };

  // Auth state listener
  useEffect(() => {
    // Set up the auth state change listener
    const { data: { subscription } } = setupAuthListener(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setLoading(true);
        
        if (session?.user) {
          setSupabaseUser(session.user);
          setIsAuthenticated(true);
          
          // Use setTimeout to prevent deadlocks
          setTimeout(async () => {
            try {
              const appUser = await fetchUserProfile(session.user.id);
              if (appUser) {
                // Add the email from the session
                appUser.email = session.user.email || '';
                setCurrentUser(appUser);
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
      const session = await getCurrentSession();
      console.log("Initial session check:", session);
      
      if (session?.user) {
        setSupabaseUser(session.user);
        setIsAuthenticated(true);
        
        const appUser = await fetchUserProfile(session.user.id);
        if (appUser) {
          // Add the email from the session
          appUser.email = session.user.email || '';
          setCurrentUser(appUser);
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
        loading: loading || actionsLoading,
        updateUserLocation,
        updateUserProfile,
        blockUser,
        unblockUser,
        reportUser,
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
