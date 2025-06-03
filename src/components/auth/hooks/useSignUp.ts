
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
      console.log("Starting signup process...");
      console.log("Signup attempt for email:", values.email);
      
      // Validate input before making the request
      if (!values.email || !values.password || !values.name) {
        throw new Error('All fields are required');
      }
      
      if (values.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Check if we can reach the Supabase client
      console.log("Checking Supabase client connectivity...");
      
      const { data, error } = await signUp(
        values.email.trim(),
        values.password,
        values.name.trim()
      );
      
      console.log("Signup response received:", { data: !!data, error: !!error });
      
      if (error) {
        console.error("Signup error details:", {
          message: error.message,
          status: error.status,
          statusCode: error.status,
          cause: error.cause
        });
        
        // Handle specific error cases with user-friendly messages
        if (error.message.includes('User already registered') || error.message.includes('already registered')) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          // Automatically switch to login form
          setTimeout(() => onToggleForm(), 2000);
        } else if (error.message.includes('Invalid email') || error.message.includes('invalid_email')) {
          toast({
            title: "Invalid email address",
            description: "Please enter a valid email address.",
            variant: "destructive",
          });
        } else if (error.message.includes('Password') || error.message.includes('password')) {
          toast({
            title: "Password requirements not met",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          });
        } else if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the server. Please check your internet connection and try again.",
            variant: "destructive",
          });
        } else if (error.message.includes('Network') || error.message.includes('network')) {
          toast({
            title: "Network Error",
            description: "Network connection failed. Please check your internet connection.",
            variant: "destructive",
          });
        } else {
          // For any other errors, provide a generic message with more details
          toast({
            title: "Sign up failed",
            description: error.message || "Unable to create account. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
      if (data && data.user) {
        console.log("Signup successful for user:", data.user.id);
        
        // With email confirmations disabled, user should be immediately authenticated
        if (data.session) {
          console.log("User authenticated immediately with session");
          setIsAuthenticated(true);
          setSupabaseUser(data.user);
          
          toast({
            title: "Account created successfully!",
            description: "Welcome to Kairo! Let's set up your profile.",
          });
          
          // Proceed to profile setup
          onContinue();
        } else {
          // If user is created but no session, they still need to sign in
          console.log("User created but no session - email confirmation may be required");
          toast({
            title: "Account created!",
            description: "Please check your email for verification, then sign in.",
          });
          onToggleForm();
        }
      } else {
        console.error("Unexpected signup response: no user data");
        toast({
          title: "Sign up failed",
          description: "Unexpected response from server. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Unexpected signup error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Handle different types of network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast({
          title: "Connection Failed",
          description: "Cannot connect to the authentication server. Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else if (error.name === 'NetworkError' || error.message.includes('Network')) {
        toast({
          title: "Network Error",
          description: "Network connection failed. Please check your connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up failed",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSignUp,
  };
};
