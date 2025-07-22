
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { getBusinessProfile } from '@/lib/supabase/businessProfiles';
import Landing from './Landing';

const Index: React.FC = () => {
  console.log("Index component rendering");
  
  const { isAuthenticated, currentUser, loading } = useAppContext();
  const navigate = useNavigate();
  
  console.log("Index state:", { isAuthenticated, hasCurrentUser: !!currentUser, loading });

  useEffect(() => {
    const handleRedirect = async () => {
      if (loading) {
        console.log("Still loading, waiting...");
        return;
      }

      // Only redirect authenticated users
      if (isAuthenticated && currentUser) {
        try {
          const businessProfile = await getBusinessProfile(currentUser.id);
          const isBusinessUser = !!businessProfile;
          
          if (isBusinessUser) {
            console.log("Business user, redirecting to map");
            navigate('/map', { replace: true });
          } else if (currentUser.bio) {
            console.log("Regular user with complete profile, redirecting to home");
            navigate('/home', { replace: true });
          } else {
            console.log("User needs to complete profile, redirecting to auth");
            navigate('/auth', { replace: true });
          }
        } catch (error) {
          console.error('Error checking business profile:', error);
          navigate('/auth', { replace: true });
        }
      }
    };

    handleRedirect();
  }, [isAuthenticated, currentUser, loading, navigate]);

  // Show loading while determining where to redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
    return <Landing />;
  }

  // Default fallback for authenticated users (should not be reached due to useEffect redirects)
  return null;
};

export default Index;
