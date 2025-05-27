
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { signUp } from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';
import { SignUpFormValues } from '../types';

export const useSignUp = (onToggleForm: () => void, onContinue: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setIsAuthenticated, setSupabaseUser } = useAppContext();

  const handleSignUp = async (values: SignUpFormValues) => {
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
        
        // Handle specific error cases with user-friendly messages
        if (error.message.includes('User already registered')) {
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
          // For any other errors, provide a generic message
          toast({
            title: "Sign up failed",
            description: "Unable to create account. Please try again or contact support if the issue persists.",
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
          // If no session but user exists, it means confirmation is still required
          toast({
            title: "Account created!",
            description: "Please check your email to confirm your account.",
          });
        }
      }
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSignUp,
  };
};
