
import React from 'react';
import TestEmailForm from '@/components/test/TestEmailForm';

const TestEmail: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Email Test</h1>
        <p className="text-gray-600">Test your email configuration</p>
      </div>
      <TestEmailForm />
    </div>
  );
};

export default TestEmail;
