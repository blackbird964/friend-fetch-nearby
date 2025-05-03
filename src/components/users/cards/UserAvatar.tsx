
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, CircleDot, Circle } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  isOnline?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  src, 
  alt = 'User', 
  size = 'md',
  showStatus = false,
  isOnline = false
}) => {
  const sizeClass = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };
  
  const iconSize = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const statusSize = {
    sm: 'h-3 w-3 bottom-0 right-0',
    md: 'h-4 w-4 bottom-0 right-0',
    lg: 'h-5 w-5 bottom-0 right-0',
    xl: 'h-6 w-6 bottom-0 right-0'
  };
  
  return (
    <div className="relative">
      <Avatar className={sizeClass[size]}>
        <AvatarImage src={src || ''} alt={alt} />
        <AvatarFallback className="bg-gray-100">
          <User className={iconSize[size]} />
        </AvatarFallback>
      </Avatar>
      
      {showStatus && (
        <span className={`absolute ${statusSize[size]} border-2 border-white rounded-full bg-${isOnline ? 'green' : 'gray'}-500`}>
        </span>
      )}
    </div>
  );
};

export default UserAvatar;
