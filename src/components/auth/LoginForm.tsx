
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { signIn } from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';
import { requestPasswordReset } from '@/services/auth/authService';
import PasswordResetForm from './components/PasswordResetForm';
import LoginFormFields from './components/LoginFormFields';
import LoginFormFooter from './components/LoginFormFooter';

type LoginFormValues = {
  email: string;
  password: string;
};

interface LoginFormProps {
  onToggleForm: () => void;
  onToggleBusinessForm?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm, onToggleBusinessForm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { toast } = useToast();
  const { setIsAuthenticated } = useAppContext();

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      if (forgotPassword) {
        // Handle password reset
        const { error } = await requestPasswordReset(values.email);
        
        if (error) {
          throw new Error(error);
        }
        
        setResetEmailSent(true);
        toast({
          title: "Password reset email sent",
          description: "Check your email for a link to reset your password. It may take a few minutes to arrive.",
        });
      } else {
        // Handle normal login
        const { data, error } = await signIn(values.email, values.password);
        
        if (error) {
          throw error;
        }
        
        if (data?.user) {
          setIsAuthenticated(true);
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: forgotPassword ? "Password reset failed" : "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      console.error(forgotPassword ? 'Password reset error:' : 'Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForgotPassword(false);
    setResetEmailSent(false);
    form.reset();
  };

  const handleToggleForgotPassword = () => {
    setForgotPassword(!forgotPassword);
  };

  return (
    <Card className="w-full max-w-md shadow-md border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {forgotPassword ? "Reset Password" : "Sign In"}
        </CardTitle>
        <CardDescription className="text-center">
          {forgotPassword 
            ? "Enter your email to receive a password reset link"
            : "Enter your email and password to sign in"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetEmailSent ? (
          <PasswordResetForm onBackToSignIn={resetForm} />
        ) : (
          <LoginFormFields 
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoading}
            forgotPassword={forgotPassword}
          />
        )}
      </CardContent>
      <LoginFormFooter
        resetEmailSent={resetEmailSent}
        isLoading={isLoading}
        forgotPassword={forgotPassword}
        onToggleForm={onToggleForm}
        onToggleBusinessForm={onToggleBusinessForm}
        onToggleForgotPassword={handleToggleForgotPassword}
      />
    </Card>
  );
};

export default LoginForm;
