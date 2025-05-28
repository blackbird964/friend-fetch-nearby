
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { signUp } from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';

type BusinessSignUpFormValues = {
  business_name: string;
  email: string;
  password: string;
  business_type: 'cafe' | 'bar' | 'restaurant' | 'lunch_spot' | 'other';
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
};

export const useBusinessSignUp = (onToggleForm: () => void, onContinue: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setIsAuthenticated, setSupabaseUser } = useAppContext();

  const handleSignUp = async (values: BusinessSignUpFormValues) => {
    setIsLoading(true);
    try {
      console.log("Attempting business signup with:", values.email);
      
      // Create auth user with business metadata
      const { data, error } = await signUp(
        values.email,
        values.password,
        values.business_name,
        {
          user_type: 'business',
          business_name: values.business_name,
          business_type: values.business_type,
          description: values.description,
          address: values.address,
          phone: values.phone,
          website: values.website
        }
      );
      
      if (error) {
        console.error("Business signup error:", error);
        
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
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
            title: "Business sign up failed",
            description: error.message || "Unable to create business account. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
      if (data && data.user) {
        console.log("Business signup successful, user:", data);
        
        if (data.session) {
          setIsAuthenticated(true);
          setSupabaseUser(data.user);
          
          toast({
            title: "Business account created successfully!",
            description: "Welcome to Kairo! Let's set up your business profile.",
          });
          
          onContinue();
        } else {
          toast({
            title: "Business account created!",
            description: "Please sign in with your new business account.",
          });
          onToggleForm();
        }
      }
    } catch (error: any) {
      console.error('Unexpected business signup error:', error);
      toast({
        title: "Business sign up failed",
        description: error.message || "An unexpected error occurred. Please try again.",
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
