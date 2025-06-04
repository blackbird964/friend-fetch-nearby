
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, MessageCircle } from 'lucide-react';
import { AppUser } from '@/context/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useChatActions } from '@/components/users/hooks/useChatActions';
import ActivePriorities from '@/components/users/nearby-users/user-details/ActivePriorities';

interface UserRequestCardProps {
  user: AppUser;
  selectedDuration: number;
  setSelectedDuration: React.Dispatch<React.SetStateAction<number>>;
  onCancel: (e: React.MouseEvent) => void;
}

const UserRequestCard: React.FC<UserRequestCardProps> = ({
  user,
  selectedDuration,
  setSelectedDuration,
  onCancel
}) => {
  const { startChat, loading } = useChatActions();
  
  // Log when component renders
  React.useEffect(() => {
    console.log("[UserRequestCard] Rendered for user:", user?.name, "ID:", user?.id);
  }, [user]);

  // Handle chat button click
  const handleChatClick = async (e: React.MouseEvent) => {
    console.log("[UserRequestCard] Chat button clicked for user:", user?.name, "ID:", user?.id);
    
    // Prevent the click from propagating to parent elements
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !user.id) {
      console.error("[UserRequestCard] Cannot start chat: Invalid user data", user);
      return;
    }
    
    try {
      console.log("[UserRequestCard] Attempting to start chat with user:", user.name);
      await startChat(user);
      console.log("[UserRequestCard] Chat started successfully");
      
      // Close the card after starting chat
      onCancel(e);
    } catch (error) {
      console.error("[UserRequestCard] Error starting chat:", error);
      // Don't close the card if there's an error
    }
  };

  // Handle cancel button click
  const handleCancelClick = (e: React.MouseEvent) => {
    console.log("[UserRequestCard] Cancel button clicked");
    e.preventDefault();
    e.stopPropagation();
    onCancel(e);
  };

  // Handle X button click
  const handleCloseClick = (e: React.MouseEvent) => {
    console.log("[UserRequestCard] Close (X) button clicked");
    e.preventDefault();
    e.stopPropagation();
    onCancel(e);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="p-4 bg-white shadow-lg animate-slide-in-bottom user-popup-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div>
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={user.profile_pic} />
                  <AvatarFallback>{getInitials(user.name || 'User')}</AvatarFallback>
                </Avatar>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profile_pic} />
                  <AvatarFallback>{getInitials(user.name || 'User')}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{user.name}</h4>
                  {user.bio && <p className="text-sm text-gray-500">{user.bio}</p>}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-xs text-muted-foreground">Wants to meet up</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="rounded-full h-8 w-8 p-0"
          onClick={handleCloseClick}
          type="button"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      
      {/* Display user's activities and preferred duration */}
      <div className="mb-4 space-y-3">
        {user.active_priorities && user.active_priorities.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Wants to do:</h4>
            <ActivePriorities priorities={user.active_priorities} />
          </div>
        )}
        
        {user.preferredHangoutDuration && (
          <div className="bg-blue-50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-1">Preferred duration:</h4>
            <p className="text-sm text-blue-700">{user.preferredHangoutDuration} minutes</p>
          </div>
        )}
        
        {(!user.active_priorities || user.active_priorities.length === 0) && !user.preferredHangoutDuration && (
          <div className="bg-gray-50 p-3 rounded-md text-center">
            <p className="text-sm text-gray-500">No specific activities or duration set</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleCancelClick}
          type="button"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleChatClick}
          type="button"
          disabled={loading || !user?.id}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {loading ? 'Starting...' : 'Chat'}
        </Button>
      </div>
    </Card>
  );
};

export default UserRequestCard;
