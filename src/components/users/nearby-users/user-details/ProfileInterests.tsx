
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface ProfileInterestsProps {
  interests: string[] | undefined;
}

const ProfileInterests: React.FC<ProfileInterestsProps> = ({ interests }) => {
  if (!interests || interests.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Interests</h3>
      <div className="flex flex-wrap gap-1.5">
        {interests.map((interest) => (
          <Badge key={interest} variant="secondary" className="text-xs">
            {interest}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ProfileInterests;
