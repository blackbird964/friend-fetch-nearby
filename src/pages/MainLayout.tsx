
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useAppContext } from '@/context/AppContext';
import { getBusinessProfile } from '@/lib/supabase/businessProfiles';

const MainLayout: React.FC = () => {
  const { isAuthenticated, currentUser } = useAppContext();
  const [isBusinessUser, setIsBusinessUser] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is a business user
  useEffect(() => {
    const checkBusinessUser = async () => {
      if (isAuthenticated && currentUser) {
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
  }, [isAuthenticated, currentUser]);

  // If user isn't authenticated, navigate to auth page
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // If user is authenticated but doesn't have a complete profile and is not a business user
  // They should complete their profile first
  useEffect(() => {
    if (isAuthenticated && isBusinessUser === false && currentUser && !currentUser.bio) {
      console.log("User needs to complete profile:", currentUser);
      navigate('/');
    }
  }, [isAuthenticated, currentUser, isBusinessUser, navigate]);

  // If user is authenticated and has completed their profile (or is a business user), they can access the app
  useEffect(() => {
    if (isAuthenticated && currentUser && location.pathname === '/') {
      if (isBusinessUser === true || currentUser.bio) {
        navigate('/home');
      }
    }
  }, [isAuthenticated, currentUser, isBusinessUser, location.pathname, navigate]);

  return (
    <>
      <main className="min-h-screen">
        <Outlet />
      </main>
      <BottomNavigation />
    </>
  );
};

export default MainLayout;
