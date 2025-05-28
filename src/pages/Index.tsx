
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, loading } = useAppContext();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/landing');
    } else if (currentUser?.bio) {
      navigate('/home');
    } else {
      navigate('/auth');
    }
  }, [isAuthenticated, currentUser, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
};

export default Index;
