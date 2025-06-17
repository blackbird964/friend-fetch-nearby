
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      setError('No email address provided');
    }
  }, [email]);

  const handleUnsubscribe = async () => {
    if (!email) return;
    
    setIsUnsubscribing(true);
    setError(null);
    
    try {
      // Update the user's email notification preference
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications_enabled: false })
        .eq('email', email);
        
      if (error) {
        throw error;
      }
      
      setIsUnsubscribed(true);
    } catch (err: any) {
      console.error('Error unsubscribing:', err);
      setError('Failed to unsubscribe. Please try again or contact support.');
    } finally {
      setIsUnsubscribing(false);
    }
  };

  if (isUnsubscribed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Successfully Unsubscribed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You have been unsubscribed from email notifications.
            </p>
            <p className="text-sm text-gray-500">
              You can re-enable notifications anytime in your profile settings.
            </p>
            <Link to="/auth">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>Unsubscribe from Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-center">
                Are you sure you want to unsubscribe from email notifications?
              </p>
              {email && (
                <p className="text-sm text-gray-500 text-center bg-gray-50 p-2 rounded">
                  Email: {email}
                </p>
              )}
              <p className="text-xs text-gray-500 text-center">
                You will no longer receive emails about friend requests, meetup requests, and other notifications.
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleUnsubscribe}
                  disabled={isUnsubscribing || !email}
                  className="w-full"
                  variant="destructive"
                >
                  {isUnsubscribing ? 'Unsubscribing...' : 'Yes, Unsubscribe'}
                </Button>
                
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnsubscribePage;
