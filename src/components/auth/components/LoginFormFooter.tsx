
import React from 'react';
import { CardFooter } from "@/components/ui/card";

interface LoginFormFooterProps {
  resetEmailSent: boolean;
  isLoading: boolean;
  forgotPassword: boolean;
  onToggleForm: () => void;
  onToggleBusinessForm?: () => void;
  onToggleForgotPassword: () => void;
}

const LoginFormFooter: React.FC<LoginFormFooterProps> = ({
  resetEmailSent,
  isLoading,
  forgotPassword,
  onToggleForm,
  onToggleBusinessForm,
  onToggleForgotPassword
}) => {
  return (
    <CardFooter className="flex flex-col space-y-2">
      {!resetEmailSent && (
        <>
          <div className="text-sm text-center text-gray-500">
            Don't have an account?{" "}
            <button
              onClick={onToggleForm}
              className="text-primary underline font-medium hover:text-primary/80"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </div>
          {onToggleBusinessForm && (
            <div className="text-sm text-center text-gray-500">
              Are you a business wanting to be listed?{" "}
              <button
                onClick={onToggleBusinessForm}
                className="text-primary underline font-medium hover:text-primary/80"
                disabled={isLoading}
              >
                Sign up here
              </button>
            </div>
          )}
          <div className="text-sm text-center text-gray-500">
            <button
              onClick={onToggleForgotPassword}
              className="text-primary underline font-medium hover:text-primary/80"
              disabled={isLoading}
            >
              {forgotPassword ? "Back to Sign In" : "Forgot Password?"}
            </button>
          </div>
        </>
      )}
    </CardFooter>
  );
};

export default LoginFormFooter;
