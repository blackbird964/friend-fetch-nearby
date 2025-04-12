
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
  useEffect(() => {
    if (isAuthenticated && currentUser && !currentUser.age && location.pathname !== '/') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate, location.pathname]);

  // If user is on root path, navigate to home
  useEffect(() => {
    if (isAuthenticated && currentUser?.age && location.pathname === '/') {
      navigate('/home');
    }
  }, [isAuthenticated, currentUser, location.pathname, navigate]);

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
      <BottomNavigation />
    </>
  );
};

export default MainLayout;
