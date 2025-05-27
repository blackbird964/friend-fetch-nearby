
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useSignUp } from './hooks/useSignUp';
import { SignUpFormValues, SignUpFormProps } from './types';
import SignUpFormHeader from './components/SignUpFormHeader';
import SignUpFormFields from './components/SignUpFormFields';
import SignUpFormFooter from './components/SignUpFormFooter';

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm, onContinue }) => {
  const { isLoading, handleSignUp } = useSignUp(onToggleForm, onContinue);

  const form = useForm<SignUpFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: SignUpFormValues) => {
    handleSignUp(values);
  };

  return (
    <Card className="w-full max-w-md shadow-md border">
      <SignUpFormHeader />
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SignUpFormFields form={form} isLoading={isLoading} />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <SignUpFormFooter onToggleForm={onToggleForm} isLoading={isLoading} />
    </Card>
  );
};

export default SignUpForm;
