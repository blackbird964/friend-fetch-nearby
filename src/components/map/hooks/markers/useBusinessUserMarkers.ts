
import { useEffect, useState } from 'react';
import { AppUser } from '@/context/types';
import { getBusinessProfile } from '@/lib/supabase/businessProfiles';

export const useBusinessUserMarkers = (currentUser: AppUser | null) => {
  const [isBusinessUser, setIsBusinessUser] = useState<boolean | null>(null);
  
  // Check if current user is a business user
  useEffect(() => {
    const checkBusinessUser = async () => {
      if (currentUser) {
        try {
          const businessProfile = await getBusinessProfile(currentUser.id);
          setIsBusinessUser(!!businessProfile);
        } catch (error) {
          console.error('Error checking business profile:', error);
          setIsBusinessUser(false);
        }
      }
    };
    
    checkBusinessUser();
  }, [currentUser]);
  
  return { isBusinessUser };
};
