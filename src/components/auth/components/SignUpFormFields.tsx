
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SignUpFormValues } from '../types';

interface SignUpFormFieldsProps {
  form: UseFormReturn<SignUpFormValues>;
  isLoading: boolean;
}

const SignUpFormFields: React.FC<SignUpFormFieldsProps> = ({ form, isLoading }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        rules={{
          required: "Full name is required",
          minLength: {
            value: 2,
            message: "Name must be at least 2 characters"
          }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="John Doe" 
                {...field} 
                disabled={isLoading}
                required
                aria-describedby="name-error"
              />
            </FormControl>
            <FormMessage id="name-error" />
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
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="email@example.com" 
                {...field} 
                type="email"
                autoComplete="email"
                disabled={isLoading}
                required
                aria-describedby="email-error"
              />
            </FormControl>
            <FormMessage id="email-error" />
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
                aria-describedby="password-error"
              />
            </FormControl>
            <FormMessage id="password-error" />
          </FormItem>
        )}
      />
    </>
  );
};

export default SignUpFormFields;
