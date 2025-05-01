
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import ProfileSetupForm from '@/components/auth/ProfileSetupForm';
import { useAppContext } from '@/context/AppContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Auth: React.FC = () => {
  const [formState, setFormState] = useState<'login' | 'signup' | 'profile-setup'>('login');
  const { isAuthenticated, loading, setIsAuthenticated, setSupabaseUser, currentUser } = useAppContext();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Check for email confirmation parameters
  const confirmationToken = searchParams.get('token_hash');
  const type = searchParams.get('type');
  
  // Debug authentication state
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Auth component - User is authenticated:", { currentUser });
    }
  }, [isAuthenticated, currentUser]);
  
  useEffect(() => {
    // Handle email confirmation if token is present
    const handleEmailConfirmation = async () => {
      if (confirmationToken && type === 'email_confirmation') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: confirmationToken,
            type: 'email',
          });
          
          if (error) {
            toast({
              title: 'Verification failed',
              description: error.message,
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Email verified successfully!',
              description: 'You can now sign in to your account.',
              variant: 'default',
            });
            setFormState('login');
          }
        } catch (err) {
          console.error('Error during email verification:', err);
          toast({
            title: 'Verification error',
            description: 'There was a problem verifying your email. Please try again.',
            variant: 'destructive',
          });
        }
      }
    };
    
    handleEmailConfirmation();
  }, [confirmationToken, type, toast]);

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

  // If authenticated and has a complete profile, redirect to home
  if (isAuthenticated && currentUser?.age && !loading) {
    console.log("User has complete profile, redirecting to home");
    return <Navigate to="/home" replace />;
  }
  
  // If authenticated but profile is incomplete, show profile setup
  if (isAuthenticated && currentUser && !loading) {
    if (!currentUser.age) {
      console.log("User profile is incomplete, showing profile setup");
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Kairo</h1>
            <p className="text-gray-600">Complete your profile to continue</p>
          </div>
          <ProfileSetupForm />
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Kairo</h1>
        <p className="text-gray-600">Connect with people nearby, right now.</p>
      </div>

      {formState === 'login' ? (
        <LoginForm onToggleForm={() => setFormState('signup')} />
      ) : formState === 'signup' ? (
        <SignUpForm 
          onToggleForm={() => setFormState('login')} 
          onContinue={() => {
            console.log("User signed up, showing profile setup");
            setFormState('profile-setup');
          }}
        />
      ) : null}
    </div>
  );
};

export default Auth;
