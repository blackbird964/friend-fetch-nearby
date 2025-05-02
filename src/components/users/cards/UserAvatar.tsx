
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  src, 
  alt = 'User', 
  size = 'md' 
}) => {
  const sizeClass = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  const iconSize = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  return (
    <Avatar className={sizeClass[size]}>
      <AvatarImage src={src || ''} alt={alt} />
      <AvatarFallback>
        <User className={iconSize[size]} />
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
