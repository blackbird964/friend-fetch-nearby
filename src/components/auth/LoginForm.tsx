import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { signIn } from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';
import { requestPasswordReset } from '@/services/auth/authService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

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
              onClick={resetForm}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@example.com" 
                        {...field} 
                        type="email"
                        autoComplete="email"
                        disabled={isLoading}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!forgotPassword && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••" 
                          type="password" 
                          {...field}
                          autoComplete="current-password"
                          disabled={isLoading}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {forgotPassword && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertDescription>
                    <p className="text-sm text-blue-700">
                      You will receive an email from Supabase with a link to reset your password.
                      Please check your spam folder if you don't see it in your inbox.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading 
                  ? (forgotPassword ? "Sending..." : "Signing in...") 
                  : (forgotPassword ? "Send Reset Link" : "Sign In")
                }
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
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
                onClick={() => setForgotPassword(!forgotPassword)}
                className="text-primary underline font-medium hover:text-primary/80"
                disabled={isLoading}
              >
                {forgotPassword ? "Back to Sign In" : "Forgot Password?"}
              </button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
