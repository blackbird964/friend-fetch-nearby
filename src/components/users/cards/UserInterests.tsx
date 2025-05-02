
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface UserInterestsProps {
  interests: string[];
  maxDisplay?: number;
}

const UserInterests: React.FC<UserInterestsProps> = ({ 
  interests, 
  maxDisplay = 3 
}) => {
  if (!interests || interests.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {interests.slice(0, maxDisplay).map((interest) => (
        <Badge key={interest} variant="secondary" className="text-xs">
          {interest}
        </Badge>
      ))}
      {interests.length > maxDisplay && (
        <span className="text-xs text-gray-500">+{interests.length - maxDisplay}</span>
      )}
    </div>
  );
};

export default UserInterests;
