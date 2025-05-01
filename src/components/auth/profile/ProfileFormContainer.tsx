
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileFormContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const ProfileFormContainer: React.FC<ProfileFormContainerProps> = ({
  children,
  title = "Complete Your Profile",
  description = "Tell us about yourself to help find the right friends"
}) => {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default ProfileFormContainer;
