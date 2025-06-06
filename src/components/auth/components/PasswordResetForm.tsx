
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from "@/components/ui/button";
import { Info } from 'lucide-react';

interface PasswordResetFormProps {
  onBackToSignIn: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onBackToSignIn }) => {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium text-blue-800">Password reset email sent!</p>
            <p className="text-blue-700 text-sm">
              Check your email inbox for a message from Supabase with a link to reset your password. 
              <strong> The email might be in your spam/junk folder</strong>, so please check there if you don't see it in your inbox.
            </p>
          </div>
        </AlertDescription>
      </Alert>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full" 
        onClick={onBackToSignIn}
      >
        Back to Sign In
      </Button>
    </div>
  );
};

export default PasswordResetForm;
