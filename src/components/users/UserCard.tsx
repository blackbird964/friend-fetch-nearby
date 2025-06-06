
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from 'lucide-react';
import { AppUser } from '@/context/types';
import ActivePriorities from '@/components/users/nearby-users/user-details/ActivePriorities';

interface UserCardProps {
  user: AppUser;
  onClick?: () => void;
  className?: string;
  minimal?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick, className = "", minimal = false }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <CardContent className={minimal ? "p-3" : "p-4"}>
        <div className="flex items-start space-x-3">
          <Avatar className={`${minimal ? "h-10 w-10" : "h-12 w-12"} border-2 border-primary`}>
            <AvatarImage src={user.profile_pic} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(user.name || 'User')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-semibold ${minimal ? "text-base" : "text-lg"} truncate`}>{user.name}</h3>
              {user.distance && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {user.distance.toFixed(1)}km
                </div>
              )}
            </div>
            
            {user.age && user.gender && (
              <p className="text-sm text-muted-foreground mb-2">{user.age} • {user.gender}</p>
            )}
            
            {!minimal && user.bio && (
              <p className="text-sm text-gray-600 italic mb-3 line-clamp-2">"{user.bio}"</p>
            )}
            
            {/* Display user's activities */}
            <div className={`${minimal ? "mb-2" : "mb-3"} space-y-2`}>
              {user.active_priorities && user.active_priorities.length > 0 && (
                <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <h4 className="text-xs font-medium mb-1 text-blue-800">Looking to do:</h4>
                  <ActivePriorities priorities={user.active_priorities} />
                </div>
              )}
              
              {user.preferredHangoutDuration && (
                <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-green-700" />
                    <span className="text-xs text-green-700 font-medium">{user.preferredHangoutDuration} min</span>
                  </div>
                </div>
              )}
            </div>
            
            {user.interests && user.interests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {user.interests.slice(0, minimal ? 2 : 3).map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {user.interests.length > (minimal ? 2 : 3) && (
                  <Badge variant="outline" className="text-xs">
                    +{user.interests.length - (minimal ? 2 : 3)} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
