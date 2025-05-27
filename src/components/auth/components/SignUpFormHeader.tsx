
import React from 'react';
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SignUpFormHeader: React.FC = () => {
  return (
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
      <CardDescription className="text-center">
        Enter your details to create a new account
      </CardDescription>
    </CardHeader>
  );
};

export default SignUpFormHeader;
