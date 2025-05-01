
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import { useAppContext } from '@/context/AppContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const Auth: React.FC = () => {
  const [formState, setFormState] = useState<'login' | 'signup'>('login');
  const { isAuthenticated, loading, setIsAuthenticated, setSupabaseUser } = useAppContext();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Initial session check in Auth:", data.session);
      
      if (data.session) {
        setIsAuthenticated(true);
        setSupabaseUser(data.session.user);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (session) {
        setIsAuthenticated(true);
        setSupabaseUser(session.user);
      } else {
        setIsAuthenticated(false);
        setSupabaseUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [setIsAuthenticated, setSupabaseUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Kairo</h1>
        <p className="text-gray-600">Connect with people nearby, right now.</p>
      </div>

      {formState === 'login' ? (
        <LoginForm onToggleForm={() => setFormState('signup')} />
      ) : (
        <SignUpForm 
          onToggleForm={() => setFormState('login')} 
          onContinue={() => {
            console.log("User signed up, redirecting to home");
            // The user will be automatically redirected if authentication is successful
            // This is handled by the useEffect hook in this component
          }}
        />
      )}
    </div>
  );
};

export default Auth;
