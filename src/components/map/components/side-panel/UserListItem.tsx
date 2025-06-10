
import React from 'react';
import { AppUser } from '@/context/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserListItemProps {
  user: AppUser;
  currentUser: AppUser | null;
  onClick: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({
  user,
  currentUser,
  onClick
}) => {
  // Calculate distance if both users have locations
  const calculateDistance = () => {
    if (!user.location || !currentUser?.location) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (currentUser.location.lat - user.location.lat) * Math.PI / 180;
    const dLon = (currentUser.location.lng - user.location.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(user.location.lat * Math.PI / 180) * Math.cos(currentUser.location.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const distance = calculateDistance();
  const displayActivities = user.todayActivities?.slice(0, 2) || [];

  return (
    <div 
      className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage src={user.profile_pic || undefined} alt={user.name || 'User'} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {(user.name || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 truncate">
              {user.name || 'Anonymous'}
            </h4>
            {distance && (
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {distance}
              </span>
            )}
          </div>
          
          {/* Activities */}
          {displayActivities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {displayActivities.map((activity, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {activity}
                </Badge>
              ))}
              {user.todayActivities && user.todayActivities.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{user.todayActivities.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          {/* Bio preview */}
          {user.bio && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListItem;
