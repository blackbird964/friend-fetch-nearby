
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  const { startChat } = useChatActions();
  
  const handleDurationChange = (value: string) => {
    setSelectedDuration(parseInt(value));
    console.log("Duration changed to:", parseInt(value));
  };

  // Prevent click events from reaching the map
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Stopping propagation on UserRequestCard click");
  };

  // Handle chat button click - navigate to chat with this user
  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Chat button clicked for user:", user.name);
    
    // First close the card to prevent UI conflicts
    onCancel(e);
    
    // Then start chat with the selected user
    console.log("Starting chat with:", user.name);
    startChat(user);
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
  
  console.log("Rendering UserRequestCard for:", user.name);
  console.log("Active priorities:", user.active_priorities);

  return (
    <Card 
      className="p-4 bg-white shadow-lg animate-slide-in-bottom user-popup-card"
      onClick={stopPropagation}
    >
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
            <p className="text-xs text-muted-foreground">Select a catch-up duration</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="rounded-full h-8 w-8 p-0"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      
      {/* Display user's activities if they have any */}
      {user.active_priorities && user.active_priorities.length > 0 && (
        <div className="mb-4 bg-gray-50 p-2 rounded-md">
          <h4 className="text-sm font-medium mb-1">I want to meet up for:</h4>
          <ActivePriorities priorities={user.active_priorities} />
        </div>
      )}
      
      <RadioGroup 
        value={selectedDuration.toString()} 
        onValueChange={handleDurationChange}
        className="flex gap-2 mb-4"
        onClick={stopPropagation}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="15" id="r1" />
          <Label htmlFor="r1" className="text-sm">15 min</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="30" id="r2" />
          <Label htmlFor="r2" className="text-sm">30 min</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="45" id="r3" />
          <Label htmlFor="r3" className="text-sm">45 min</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="60" id="r4" />
          <Label htmlFor="r4" className="text-sm">60 min</Label>
        </div>
      </RadioGroup>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleChatClick}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Chat
        </Button>
      </div>
    </Card>
  );
};

export default UserRequestCard;
