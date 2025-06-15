
import React from 'react';
import { AppUser } from '@/context/types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';

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

  // Safely handle active_priorities - ensure it's always an array
  const activePriorities = React.useMemo(() => {
    if (!user.active_priorities) return [];
    
    // If it's already an array, use it
    if (Array.isArray(user.active_priorities)) {
      return user.active_priorities;
    }
    
    // If it's a string (JSON), try to parse it
    if (typeof user.active_priorities === 'string') {
      try {
        const parsed = JSON.parse(user.active_priorities);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.warn('Failed to parse active_priorities:', error);
        return [];
      }
    }
    
    // If it's a single object, wrap it in an array
    if (typeof user.active_priorities === 'object' && user.active_priorities !== null) {
      return [user.active_priorities];
    }
    
    return [];
  }, [user.active_priorities]);

  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onClick={handleSelect}>
      <div className="flex items-center space-x-3">
        <UserAvatar 
          src={user.profile_pic} 
          alt={user.name} 
          size="md"
          showStatus={true}
          isOnline={user.isOnline}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">{user.name}</h3>
            {user.isOnline && (
              <span className="text-xs text-green-600 font-medium">Online</span>
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
      {activePriorities.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {activePriorities.slice(0, 2).map((priority, index) => (
              <Badge key={priority.id || index} variant="secondary" className="text-xs">
                {priority.activity}
              </Badge>
            ))}
            {activePriorities.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{activePriorities.length - 2}
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
