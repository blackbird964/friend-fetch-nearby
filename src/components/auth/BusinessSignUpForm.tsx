
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { signUp } from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';
import BusinessSignUpFormHeader from './components/BusinessSignUpFormHeader';
import BusinessSignUpFormFields from './components/BusinessSignUpFormFields';
import BusinessSignUpFormFooter from './components/BusinessSignUpFormFooter';

type BusinessSignUpFormValues = {
  businessName: string;
  email: string;
  password: string;
  contactPerson: string;
  phone: string;
  address: string;
  description: string;
};

interface BusinessSignUpFormProps {
  onToggleForm: () => void;
}

const BusinessSignUpForm: React.FC<BusinessSignUpFormProps> = ({ onToggleForm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setIsAuthenticated, setSupabaseUser } = useAppContext();

  const form = useForm<BusinessSignUpFormValues>({
    defaultValues: {
      businessName: '',
      email: '',
      password: '',
      contactPerson: '',
      phone: '',
      address: '',
      description: '',
    },
  });

  const onSubmit = async (values: BusinessSignUpFormValues) => {
    setIsLoading(true);
    
    try {
      console.log("Starting business signup process...");
      
      // Validate input before making the request
      if (!values.email || !values.password || !values.businessName || !values.contactPerson) {
        throw new Error('All required fields must be filled');
      }
      
      if (values.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { data, error } = await signUp(
        values.email.trim(),
        values.password,
        values.contactPerson.trim()
      );
      
      console.log("Business signup response received:", { data: !!data, error: !!error });
      
      if (error) {
        console.error("Business signup error details:", {
          message: error.message,
          status: error.status
        });
        
        // Handle specific error cases with user-friendly messages
        if (error.message.includes('User already registered') || error.message.includes('already registered')) {
          toast({
            title: "Account already exists",
            description: "A business account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else if (error.message.includes('Invalid email') || error.message.includes('invalid_email')) {
          toast({
            title: "Invalid email address",
            description: "Please enter a valid business email address.",
            variant: "destructive",
          });
        } else if (error.message.includes('Password') || error.message.includes('password')) {
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
        console.log("Business signup successful for user:", data.user.id);
        
        if (data.session) {
          console.log("Business user authenticated immediately with session");
          setIsAuthenticated(true);
          setSupabaseUser(data.user);
          
          toast({
            title: "Business account created successfully!",
            description: "Welcome to Kairo! Your business account is ready.",
          });
        } else {
          console.log("Business user created but no session");
          toast({
            title: "Business account created!",
            description: "Please check your email for verification, then sign in.",
          });
          onToggleForm();
        }
      } else {
        console.error("Unexpected business signup response: no user data");
        toast({
          title: "Business sign up failed",
          description: "Unexpected response from server. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Unexpected business signup error:', {
        message: error.message,
        name: error.name
      });
      
      toast({
        title: "Business sign up failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-md border">
      <BusinessSignUpFormHeader />
      <CardContent>
        <BusinessSignUpFormFields 
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </CardContent>
      <BusinessSignUpFormFooter
        onToggleForm={onToggleForm}
        isLoading={isLoading}
      />
    </Card>
  );
};

export default BusinessSignUpForm;
