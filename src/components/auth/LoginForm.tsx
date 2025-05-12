
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { signIn } from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';

type LoginFormValues = {
  email: string;
  password: string;
};

interface LoginFormProps {
  onToggleForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
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
        const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
          redirectTo: window.location.origin + '/?reset=true',
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Password reset email sent",
          description: "Check your email for a link to reset your password.",
        });
        setForgotPassword(false);
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading 
                ? (forgotPassword ? "Sending..." : "Signing in...") 
                : (forgotPassword ? "Send Reset Link" : "Sign In")
              }
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
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
        <div className="text-sm text-center text-gray-500">
          <button
            onClick={() => setForgotPassword(!forgotPassword)}
            className="text-primary underline font-medium hover:text-primary/80"
            disabled={isLoading}
          >
            {forgotPassword ? "Back to Sign In" : "Forgot Password?"}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
