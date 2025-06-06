
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const ForgotPasswordAlert: React.FC = () => {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-500" />
      <AlertDescription>
        <p className="text-sm text-blue-700">
          You will receive an email from Supabase with a link to reset your password.
          Please check your spam folder if you don't see it in your inbox.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default ForgotPasswordAlert;
