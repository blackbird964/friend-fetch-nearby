
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from 'lucide-react';
import { AppUser } from '@/context/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ActivePriorities from '@/components/users/nearby-users/user-details/ActivePriorities';

interface UserRequestCardProps {
  user: AppUser;
  onClose: () => void;
}

const UserRequestCard: React.FC<UserRequestCardProps> = ({
  user,
  onClose
}) => {
  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[UserRequestCard] Close button clicked");
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatAge = (age: number | null | undefined) => {
    if (!age || isNaN(age)) return null;
    return age;
  };

  const formatDuration = (duration: string | number | undefined) => {
    if (!duration || duration === 'NaN' || (typeof duration === 'string' && duration === 'NaN')) return null;
    return duration.toString();
  };

  console.log("[UserRequestCard] Rendering card for user:", user.name);

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[60] w-[90%] max-w-md">
      <Card className="p-4 bg-white shadow-xl border-2 animate-fade-in">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={user.profile_pic} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(user.name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              {(formatAge(user.age) || user.gender) && (
                <p className="text-sm text-muted-foreground">
                  {[formatAge(user.age), user.gender].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-full h-8 w-8 p-0 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            onClick={handleCloseClick}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Display user's bio if available */}
        {user.bio && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 italic">"{user.bio}"</p>
          </div>
        )}
        
        {/* Display user's activities */}
        <div className="mb-4 space-y-3">
          {user.active_priorities && user.active_priorities.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium mb-2 text-blue-800">Looking to do:</h4>
              <ActivePriorities priorities={user.active_priorities} />
            </div>
          )}
          
          {formatDuration(user.preferredHangoutDuration) && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium mb-1 text-green-800">Preferred duration:</h4>
              <p className="text-sm text-green-700 font-medium">{formatDuration(user.preferredHangoutDuration)} minutes</p>
            </div>
          )}
          
          {(!user.active_priorities || user.active_priorities.length === 0) && !formatDuration(user.preferredHangoutDuration) && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
              <p className="text-sm text-gray-500">Ready to hang out!</p>
            </div>
          )}
        </div>

        {/* Display user's interests */}
        {user.interests && user.interests.length > 0 && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <h4 className="text-sm font-medium mb-2 text-purple-800">Interests:</h4>
            <div className="flex flex-wrap gap-1.5">
              {user.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserRequestCard;
