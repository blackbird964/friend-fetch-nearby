
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { signUp } from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';

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
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Business Sign Up</CardTitle>
        <CardDescription className="text-center">
          Create a business account to get listed on Kairo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="businessName"
              rules={{
                required: "Business name is required",
                minLength: {
                  value: 2,
                  message: "Business name must be at least 2 characters"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your Business Name" 
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
              name="contactPerson"
              rules={{
                required: "Contact person is required",
                minLength: {
                  value: 2,
                  message: "Contact person name must be at least 2 characters"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
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
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="business@example.com" 
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
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long"
                }
              }}
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
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+1 (555) 123-4567" 
                      {...field} 
                      type="tel"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123 Business St, City, State" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your business..." 
                      {...field} 
                      disabled={isLoading}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Business Account..." : "Create Business Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
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

export default BusinessSignUpForm;
