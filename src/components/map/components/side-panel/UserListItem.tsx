
import React from 'react';
import { AppUser } from '@/context/types';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin } from 'lucide-react';

interface UserListItemProps {
  user: AppUser;
  onSelect: (user: AppUser) => void;
  onStartChat: (user: AppUser) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({
  user,
  onSelect,
  onStartChat
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("[UserListItem] Chat button clicked for user:", user.name);
    onStartChat(user);
  };

  const handleSelect = () => {
    console.log("[UserListItem] Selecting user:", user.name);
    onSelect(user);
  };

  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onClick={handleSelect}>
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={user.profile_pic} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getInitials(user.name || 'User')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">{user.name}</h3>
            {user.isOnline && (
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
            )}
          </div>
          
          {user.age && user.gender && (
            <p className="text-xs text-gray-500">{user.age} • {user.gender}</p>
          )}
          
          {!user.location && (
            <div className="text-xs text-amber-600 flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              <span>Location not shared</span>
            </div>
          )}
        </div>
      </div>
      
      {/* User's active priorities */}
      {user.active_priorities && user.active_priorities.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {user.active_priorities.slice(0, 2).map((priority) => (
              <Badge key={priority.id} variant="secondary" className="text-xs">
                {priority.activity}
              </Badge>
            ))}
            {user.active_priorities.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{user.active_priorities.length - 2}
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Chat button */}
      <div className="mt-2 pt-2 border-t">
        <Button 
          size="sm" 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleChatClick}
          type="button"
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          Chat
        </Button>
      </div>
    </div>
  );
};

export default UserListItem;
