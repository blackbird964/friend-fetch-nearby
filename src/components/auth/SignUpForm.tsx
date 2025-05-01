
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { signUp } from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type SignUpFormValues = {
  name: string;
  email: string;
  password: string;
};

interface SignUpFormProps {
  onToggleForm: () => void;
  onContinue: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm, onContinue }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);
  const { toast } = useToast();
  const { setIsAuthenticated, setSupabaseUser } = useAppContext();

  const form = useForm<SignUpFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    try {
      console.log("Attempting signup with:", values.email);
      const { data, error } = await signUp(
        values.email,
        values.password,
        values.name
      );
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log("Signup successful, user:", data);
        
        if (data.user && data.session) {
          // User is immediately authenticated (email confirmation might be disabled)
          setIsAuthenticated(true);
          setSupabaseUser(data.user);
          
          toast({
            title: "Account created!",
            description: "Your account has been successfully created.",
          });
          
          // After successful signup, transition to profile setup
          if (typeof onContinue === 'function') {
            onContinue();
          }
        } else if (data.user) {
          // Email confirmation is required
          setConfirmEmailSent(true);
          toast({
            title: "Signup successful!",
            description: "Please check your email to confirm your account.",
          });
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-md border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Enter your details to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {confirmEmailSent ? (
          <Alert className="mb-6">
            <AlertTitle>Confirmation email sent!</AlertTitle>
            <AlertDescription>
              Please check your inbox and click the confirmation link to complete your registration.
              If you don't see it, please check your spam folder.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        disabled={isLoading}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        autoComplete="new-password"
                        disabled={isLoading}
                        required
                        minLength={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <button
            onClick={onToggleForm}
            className="text-primary underline font-medium hover:text-primary/80"
            disabled={isLoading}
          >
            Sign In
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
