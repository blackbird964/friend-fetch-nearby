import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { getProfile } from '@/lib/supabase';
import { AppUser, Location } from './types';
import { updateUserLocation as updateLocation, updateUserProfile as updateProfile } from './userService';
import { DEFAULT_LOCATION } from '@/utils/locationUtils';
import { AuthContextType } from './AppContextTypes';
import { blockUser, unblockUser, reportUser as reportUserService } from '@/services/userActionsService';
import { toast } from "sonner";

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

  // Add block user functionality
  const blockUserAction = useCallback(async (userId: string) => {
    if (!currentUser) return false;
    
    const success = await blockUser(currentUser.id, userId);
    
    if (success) {
      // Update the current user in state with the new blocked users array
      const updatedCurrentUser = { 
        ...currentUser,
        blockedUsers: [...(currentUser.blockedUsers || []), userId]
      };
      setCurrentUser(updatedCurrentUser);
      
      toast.success("User blocked", {
        description: "You won't see this user anymore."
      });
    } else {
      toast.error("Failed to block user", {
        description: "Please try again later."
      });
    }
    
    return success;
  }, [currentUser, setCurrentUser]);

  // Add unblock user functionality
  const unblockUserAction = useCallback(async (userId: string) => {
    if (!currentUser) return false;
    
    const success = await unblockUser(currentUser.id, userId);
    
    if (success && currentUser.blockedUsers) {
      // Update the current user in state with the new blocked users array
      const updatedCurrentUser = { 
        ...currentUser,
        blockedUsers: currentUser.blockedUsers.filter(id => id !== userId)
      };
      setCurrentUser(updatedCurrentUser);
      
      toast.success("User unblocked");
    } else if (!success) {
      toast.error("Failed to unblock user", {
        description: "Please try again later."
      });
    }
    
    return success;
  }, [currentUser, setCurrentUser]);

  // Add report user functionality
  const reportUserAction = useCallback(async (userId: string, reason: string) => {
    if (!currentUser) return false;
    
    const success = await reportUserService(currentUser.id, userId, reason);
    
    if (success) {
      toast.success("Report submitted", {
        description: "Thank you for helping keep our community safe."
      });
    } else {
      toast.error("Failed to submit report", {
        description: "Please try again later."
      });
    }
    
    return success;
  }, [currentUser]);

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
        blockUser: blockUserAction,
        unblockUser: unblockUserAction,
        reportUser: reportUserAction,
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
