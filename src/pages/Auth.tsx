
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import BusinessSignUpForm from '@/components/auth/BusinessSignUpForm';
import ProfileSetupForm from '@/components/auth/ProfileSetupForm';
import { useAppContext } from '@/context/AppContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getBusinessProfile } from '@/lib/supabase/businessProfiles';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const Auth: React.FC = () => {
  const [formState, setFormState] = useState<'login' | 'signup' | 'business-signup' | 'profile-setup'>('login');
  const [isBusinessUser, setIsBusinessUser] = useState<boolean | null>(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Check for password reset parameter
  const showReset = searchParams.get('reset') === 'true';
  
  // Use a try-catch to handle context availability
  let contextData;
  try {
    contextData = useAppContext();
  } catch (error) {
    // Context not available yet, show loading
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const { isAuthenticated, loading, setIsAuthenticated, setSupabaseUser, currentUser } = contextData;
  
  // Debug authentication state
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Auth component - User is authenticated:", { currentUser });
    }
  }, [isAuthenticated, currentUser]);
  
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
        setIsBusinessUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [setIsAuthenticated, setSupabaseUser]);

  // If authenticated and is a business user, redirect to map
  if (isAuthenticated && isBusinessUser === true && !loading) {
    console.log("Business user authenticated, redirecting to map");
    return <Navigate to="/map" replace />;
  }

  // If authenticated and has a complete profile, redirect to home
  if (isAuthenticated && isBusinessUser === false && currentUser?.bio && !loading) {
    console.log("User has complete profile, redirecting to home");
    return <Navigate to="/home" replace />;
  }
  
  // If authenticated but profile is incomplete (and not a business user), show profile setup
  if (isAuthenticated && isBusinessUser === false && currentUser && !loading) {
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

  if (loading || (isAuthenticated && isBusinessUser === null)) {
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
        <LoginForm 
          onToggleForm={() => setFormState('signup')}
          onToggleBusinessForm={() => setFormState('business-signup')}
        />
      ) : formState === 'signup' ? (
        <SignUpForm 
          onToggleForm={() => setFormState('login')} 
          onContinue={() => {
            console.log("User signed up, showing profile setup");
            setFormState('profile-setup');
          }}
        />
      ) : formState === 'business-signup' ? (
        <BusinessSignUpForm 
          onToggleForm={() => setFormState('login')}
        />
      ) : null}
    </div>
  );
};

export default Auth;
