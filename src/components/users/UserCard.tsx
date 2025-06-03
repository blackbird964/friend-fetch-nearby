
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useAppContext } from '@/context/AppContext';
import { AppUser } from '@/context/types';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from 'lucide-react';

interface UserCardProps {
  user: AppUser;
  minimal?: boolean;
  onClick?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, minimal = false, onClick }) => {
  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${minimal ? '' : 'shadow-md'}`}
      onClick={onClick}
    >
      <CardContent className={`${minimal ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center space-x-3">
          <Avatar className={minimal ? 'h-10 w-10' : 'h-12 w-12'}>
            <AvatarImage src={user.profile_pic || ''} alt={user.name || 'User'} />
            <AvatarFallback>
              <User className={minimal ? 'h-5 w-5' : 'h-6 w-6'} />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className={`${minimal ? 'text-sm' : 'text-base'} font-medium`}>{user.name}</h3>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-500 mr-2">
                {user.age} • {user.gender}
              </span>
            </div>
            
            {!minimal && user.bio && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{user.bio}</p>
            )}

            {!minimal && user.todayActivities && user.todayActivities.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">I am looking for:</p>
                <div className="flex flex-wrap gap-1">
                  {user.todayActivities.slice(0, 3).map((activity) => (
                    <Badge key={activity} variant="default" className="text-xs bg-blue-500 text-white hover:bg-blue-600">
                      {activity}
                    </Badge>
                  ))}
                  {user.todayActivities.length > 3 && (
                    <span className="text-xs text-gray-500">+{user.todayActivities.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            {!minimal && user.preferredHangoutDuration && (
              <div className="mt-1">
                <span className="text-xs text-gray-500">
                  Duration: {user.preferredHangoutDuration} min
                </span>
              </div>
            )}
            
            {!minimal && user.interests && user.interests.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <p className="text-xs text-gray-500 mb-1 w-full">I am into:</p>
                {user.interests.slice(0, 3).map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {user.interests.length > 3 && (
                  <span className="text-xs text-gray-500">+{user.interests.length - 3}</span>
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
