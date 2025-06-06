
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type BusinessSignUpFormValues = {
  businessName: string;
  email: string;
  password: string;
  contactPerson: string;
  phone: string;
  address: string;
  description: string;
};

interface BusinessSignUpFormFieldsProps {
  form: UseFormReturn<BusinessSignUpFormValues>;
  onSubmit: (values: BusinessSignUpFormValues) => void;
  isLoading: boolean;
}

const BusinessSignUpFormFields: React.FC<BusinessSignUpFormFieldsProps> = ({
  form,
  onSubmit,
  isLoading
}) => {
  return (
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
  );
};

export default BusinessSignUpFormFields;
