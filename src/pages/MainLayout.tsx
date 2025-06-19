
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useAppContext } from '@/context/AppContext';
import { getBusinessProfile } from '@/lib/supabase/businessProfiles';

const MainLayout: React.FC = () => {
  console.log("MainLayout component rendering");
  
  const { isAuthenticated, currentUser } = useAppContext();
  const [isBusinessUser, setIsBusinessUser] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  console.log("[MainLayout] Current state:", {
    isAuthenticated,
    currentPath: location.pathname,
    isBusinessUser,
    hasCurrentUser: !!currentUser
  });

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to /");
      navigate('/', { replace: true });
      return;
    }
  }, [isAuthenticated, navigate]);

  // Only prevent business users from accessing home page
  useEffect(() => {
    if (isAuthenticated && isBusinessUser === true && location.pathname === '/home') {
      console.log("Business user trying to access home, redirecting to map");
      navigate('/map', { replace: true });
    }
  }, [isAuthenticated, isBusinessUser, location.pathname, navigate]);

  if (!isAuthenticated) {
    console.log("MainLayout: User not authenticated, showing nothing");
    return null;
  }

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
