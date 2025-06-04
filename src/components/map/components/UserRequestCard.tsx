
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, MessageCircle } from 'lucide-react';
import { AppUser } from '@/context/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatActions } from '@/components/users/hooks/useChatActions';
import ActivePriorities from '@/components/users/nearby-users/user-details/ActivePriorities';

interface UserRequestCardProps {
  user: AppUser;
  onClose: () => void;
}

const UserRequestCard: React.FC<UserRequestCardProps> = ({
  user,
  onClose
}) => {
  const { startChat, loading } = useChatActions();

  const handleChatClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("[UserRequestCard] Chat button clicked for user:", user?.name);
    
    if (!user || !user.id) {
      console.error("[UserRequestCard] Cannot start chat: Invalid user data", user);
      return;
    }
    
    try {
      await startChat(user);
      onClose(); // Close the card after starting chat
    } catch (error) {
      console.error("[UserRequestCard] Error starting chat:", error);
    }
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[UserRequestCard] Cancel button clicked");
    onClose();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[UserRequestCard] Close (X) button clicked");
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

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
      <Card className="p-4 bg-white shadow-lg animate-fade-in">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={user.profile_pic} />
              <AvatarFallback>{getInitials(user.name || 'User')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-xs text-muted-foreground">Wants to meet up</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-full h-8 w-8 p-0 hover:bg-gray-100"
            onClick={handleCloseClick}
          >
            <X className="h-4 w-4" />
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
            className="flex-1 hover:bg-gray-50"
            onClick={handleCancelClick}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleChatClick}
            disabled={loading || !user?.id}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {loading ? 'Starting...' : 'Chat'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserRequestCard;
