
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import ProfileSetupForm from '@/components/auth/ProfileSetupForm';
import { useAppContext } from '@/context/AppContext';
import { Navigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const [formState, setFormState] = useState<'login' | 'signup' | 'profile'>('login');
  const { isAuthenticated, currentUser, loading, supabaseUser } = useAppContext();

  // Debug auth state
  useEffect(() => {
    console.log("Auth state:", { isAuthenticated, loading, supabaseUser, currentUser });
  }, [isAuthenticated, loading, supabaseUser, currentUser]);

  // If loading, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If already authenticated and has full profile, redirect to home
  if (isAuthenticated && currentUser?.age) {
    return <Navigate to="/home" replace />;
  }

  // If authenticated but needs to complete profile
  if (isAuthenticated && supabaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <ProfileSetupForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">PairUp</h1>
        <p className="text-gray-600">Connect with people nearby, right now.</p>
      </div>

      {formState === 'login' ? (
        <LoginForm onToggleForm={() => setFormState('signup')} />
      ) : formState === 'signup' ? (
        <SignUpForm 
          onToggleForm={() => setFormState('login')} 
          onContinue={() => setFormState('profile')}
        />
      ) : (
        <ProfileSetupForm />
      )}
    </div>
  );
};

export default Auth;
