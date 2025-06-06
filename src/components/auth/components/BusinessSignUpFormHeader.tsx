
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const BusinessSignUpFormHeader: React.FC = () => {
  return (
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl font-bold text-center">Business Sign Up</CardTitle>
      <CardDescription className="text-center">
        Create a business account to get listed on Kairo
      </CardDescription>
    </CardHeader>
  );
};

export default BusinessSignUpFormHeader;
