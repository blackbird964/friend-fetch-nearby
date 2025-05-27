
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { signUp } from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';

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
        console.error("Signup error:", error);
        
        // Handle specific rate limit errors with more helpful messages
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          toast({
            title: "Rate limit reached",
            description: "This email has been used for too many signup attempts. Please try a different email address or wait 24 hours before trying again.",
            variant: "destructive",
          });
        } else if (error.message.includes('User already registered')) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          // Automatically switch to login form
          setTimeout(() => onToggleForm(), 2000);
        } else if (error.message.includes('Invalid email')) {
          toast({
            title: "Invalid email address",
            description: "Please enter a valid email address.",
            variant: "destructive",
          });
        } else if (error.message.includes('Password')) {
          toast({
            title: "Password requirements not met",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: `${error.message || "An unexpected error occurred."} Try using a different email address.`,
            variant: "destructive",
          });
        }
        return;
      }
      
      if (data && data.user) {
        console.log("Signup successful, user:", data);
        
        // With email confirmation disabled, user should be immediately authenticated
        if (data.session) {
          setIsAuthenticated(true);
          setSupabaseUser(data.user);
          
          toast({
            title: "Account created successfully!",
            description: "Welcome to Kairo! Let's set up your profile.",
          });
          
          // Proceed to profile setup
          onContinue();
        } else {
          // Fallback case - shouldn't happen with confirmations disabled
          toast({
            title: "Account created successfully!",
            description: "Please sign in with your new account.",
          });
          onToggleForm();
        }
      }
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try a different email address or check your internet connection.",
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
