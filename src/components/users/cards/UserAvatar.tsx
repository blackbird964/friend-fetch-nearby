
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, CircleDot, Circle, UserCheck, UserPlus } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  isOnline?: boolean;
  friendStatus?: 'none' | 'sent' | 'received' | 'accepted';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  src, 
  alt = 'User', 
  size = 'md',
  showStatus = false,
  isOnline = false,
  friendStatus = 'none'
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
  
  // Determine status color class based on online status
  let statusColorClass = isOnline ? 'bg-green-500' : 'bg-gray-500';
  let statusIcon = null;
  
  // Override with friend status if specified
  if (friendStatus === 'sent' || friendStatus === 'received') {
    statusColorClass = 'bg-amber-300';
    statusIcon = <UserPlus className="h-2 w-2 text-amber-800" />;
  } else if (friendStatus === 'accepted') {
    statusColorClass = 'bg-green-500';
    statusIcon = <UserCheck className="h-2 w-2 text-white" />;
  }
  
  return (
    <div className="relative">
      <Avatar className={sizeClass[size]}>
        {src ? (
          <AvatarImage src={src} alt={alt} />
        ) : (
          <AvatarFallback className="bg-gray-100">
            <User className={iconSize[size]} />
          </AvatarFallback>
        )}
      </Avatar>
      
      {showStatus && (
        <span className={`absolute ${statusSize[size]} border-2 border-white rounded-full ${statusColorClass} flex items-center justify-center`}>
          {statusIcon}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;
