
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import BusinessSignUpForm from '@/components/auth/BusinessSignUpForm';
import BusinessProfileSetupForm from '@/components/auth/BusinessProfileSetupForm';
import { useAppContext } from '@/context/AppContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { getBusinessProfile } from '@/services/business/businessService';

const BusinessAuth: React.FC = () => {
  const [formState, setFormState] = useState<'login' | 'signup' | 'profile-setup'>('login');
  const { isAuthenticated, loading, setIsAuthenticated, setSupabaseUser, currentUser } = useAppContext();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const showReset = searchParams.get('reset') === 'true';
  
  useEffect(() => {
    if (isAuthenticated) {
      console.log("BusinessAuth component - User is authenticated:", { currentUser });
    }
  }, [isAuthenticated, currentUser]);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Initial session check in BusinessAuth:", data.session);
      
      if (data.session) {
        setIsAuthenticated(true);
        setSupabaseUser(data.session.user);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("BusinessAuth state changed:", event, session);
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

  // If authenticated and has a complete business profile, redirect to home
  if (isAuthenticated && currentUser && !loading) {
    // Check if user has business profile set up
    getBusinessProfile(currentUser.id).then(business => {
      if (business && business.description) {
        console.log("Business has complete profile, redirecting to home");
        return <Navigate to="/home" replace />;
      }
    });
    
    // If business profile is incomplete, show profile setup
    console.log("Business profile may be incomplete, showing profile setup");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Kairo Business</h1>
          <p className="text-gray-600">Complete your business profile to continue</p>
        </div>
        <BusinessProfileSetupForm />
      </div>
    );
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
        <h1 className="text-3xl font-bold text-primary mb-2">Kairo Business</h1>
        <p className="text-gray-600">Connect with customers in your area.</p>
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
        <BusinessSignUpForm 
          onToggleForm={() => setFormState('login')} 
          onContinue={() => {
            console.log("Business signed up, showing profile setup");
            setFormState('profile-setup');
          }}
        />
      ) : null}
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Looking for a personal account?{" "}
          <a href="/auth" className="text-primary underline font-medium hover:text-primary/80">
            Sign up as a user
          </a>
        </p>
      </div>
    </div>
  );
};

export default BusinessAuth;
