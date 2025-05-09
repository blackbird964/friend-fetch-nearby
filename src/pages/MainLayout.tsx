
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useAppContext } from '@/context/AppContext';

const MainLayout: React.FC = () => {
  const { isAuthenticated, currentUser } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  // If user isn't authenticated, navigate to auth page
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // If user is authenticated but doesn't have a complete profile
  // They should complete their profile first
  useEffect(() => {
    if (isAuthenticated && currentUser && !currentUser.age) {
      console.log("User needs to complete profile:", currentUser);
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // If user is authenticated and has completed their profile, they can access the app
  useEffect(() => {
    if (isAuthenticated && currentUser?.age && location.pathname === '/') {
      navigate('/home');
    }
  }, [isAuthenticated, currentUser, location.pathname, navigate]);

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
