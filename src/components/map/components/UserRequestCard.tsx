
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
      console.log("[UserRequestCard] Starting chat with user:", user.name);
      await startChat(user);
      console.log("[UserRequestCard] Chat started successfully, closing card");
      onClose(); // Close the card after starting chat
    } catch (error) {
      console.error("[UserRequestCard] Error starting chat:", error);
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[UserRequestCard] Close button clicked");
    onClose();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent map clicks when interacting with the card
    e.stopPropagation();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  console.log("[UserRequestCard] Rendering card for user:", user.name);

  return (
    <div 
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md"
      style={{ zIndex: 1000 }}
      onClick={handleCardClick}
    >
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
              {user.age && user.gender && (
                <p className="text-sm text-muted-foreground">{user.age} • {user.gender}</p>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-full h-8 w-8 p-0 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            onClick={handleCloseClick}
            style={{ pointerEvents: 'auto' }}
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
          
          {user.preferredHangoutDuration && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium mb-1 text-green-800">Preferred duration:</h4>
              <p className="text-sm text-green-700 font-medium">{user.preferredHangoutDuration} minutes</p>
            </div>
          )}
          
          {(!user.active_priorities || user.active_priorities.length === 0) && !user.preferredHangoutDuration && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
              <p className="text-sm text-gray-500">Ready to hang out!</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 hover:bg-gray-50 border-gray-300"
            onClick={handleCloseClick}
            disabled={loading}
            style={{ pointerEvents: 'auto' }}
          >
            Close
          </Button>
          <Button 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            onClick={handleChatClick}
            disabled={loading || !user?.id}
            style={{ pointerEvents: 'auto' }}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {loading ? 'Starting...' : 'Start Chat'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserRequestCard;
