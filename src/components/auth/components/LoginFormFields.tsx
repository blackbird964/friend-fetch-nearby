
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ForgotPasswordAlert from './ForgotPasswordAlert';

type LoginFormValues = {
  email: string;
  password: string;
};

interface LoginFormFieldsProps {
  form: UseFormReturn<LoginFormValues>;
  onSubmit: (values: LoginFormValues) => void;
  isLoading: boolean;
  forgotPassword: boolean;
}

const LoginFormFields: React.FC<LoginFormFieldsProps> = ({ 
  form, 
  onSubmit, 
  isLoading, 
  forgotPassword 
}) => {
  return (
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
        
        {forgotPassword && <ForgotPasswordAlert />}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading 
            ? (forgotPassword ? "Sending..." : "Signing in...") 
            : (forgotPassword ? "Send Reset Link" : "Sign In")
          }
        </Button>
      </form>
    </Form>
  );
};

export default LoginFormFields;
