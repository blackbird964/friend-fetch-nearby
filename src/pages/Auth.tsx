
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import ProfileSetupForm from '@/components/auth/ProfileSetupForm';
import { useAppContext } from '@/context/AppContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const Auth: React.FC = () => {
  const [formState, setFormState] = useState<'login' | 'signup' | 'profile-setup'>('login');
  const { isAuthenticated, loading, setIsAuthenticated, setSupabaseUser, currentUser } = useAppContext();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Check for password reset parameter
  const showReset = searchParams.get('reset') === 'true';
  
  // Debug authentication state
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Auth component - User is authenticated:", { currentUser });
    }
  }, [isAuthenticated, currentUser]);
  
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
  if (isAuthenticated && currentUser?.bio && !loading) {
    console.log("User has complete profile, redirecting to home");
    return <Navigate to="/home" replace />;
  }
  
  // If authenticated but profile is incomplete, show profile setup
  if (isAuthenticated && currentUser && !loading) {
    if (!currentUser.bio) {
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

      {showReset && (
        <div className="w-full max-w-md mb-6">
          <Alert className="bg-green-50 border-green-200">
            <Info className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Password reset link verified. You can now set a new password.
            </AlertDescription>
          </Alert>
        </div>
      )}

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
