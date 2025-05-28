
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessSignUp } from './hooks/useBusinessSignUp';

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

interface BusinessSignUpFormProps {
  onToggleForm: () => void;
  onContinue: () => void;
}

const BusinessSignUpForm: React.FC<BusinessSignUpFormProps> = ({ onToggleForm, onContinue }) => {
  const { isLoading, handleSignUp } = useBusinessSignUp(onToggleForm, onContinue);

  const form = useForm<BusinessSignUpFormValues>({
    defaultValues: {
      business_name: '',
      email: '',
      password: '',
      business_type: 'other',
      description: '',
      address: '',
      phone: '',
      website: '',
    },
  });

  const onSubmit = (values: BusinessSignUpFormValues) => {
    handleSignUp(values);
  };

  return (
    <Card className="w-full max-w-md shadow-md border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Business Sign Up</CardTitle>
        <CardDescription className="text-center">
          Create your business account to connect with customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="business_name"
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
              name="business_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={isLoading}>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cafe">Cafe</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="lunch_spot">Lunch Spot</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="business@example.com" 
                      {...field} 
                      type="email"
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123 Main St, City, State" 
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell customers about your business..." 
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
              {isLoading ? "Creating Account..." : "Create Business Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="px-6 pb-6">
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
      </div>
    </Card>
  );
};

export default BusinessSignUpForm;
