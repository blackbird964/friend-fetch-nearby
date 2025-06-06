
import React from 'react';
import { CardFooter } from "@/components/ui/card";

interface BusinessSignUpFormFooterProps {
  onToggleForm: () => void;
  isLoading: boolean;
}

const BusinessSignUpFormFooter: React.FC<BusinessSignUpFormFooterProps> = ({
  onToggleForm,
  isLoading
}) => {
  return (
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
  );
};

export default BusinessSignUpFormFooter;
