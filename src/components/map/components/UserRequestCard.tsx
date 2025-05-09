
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Radio, RadioGroup } from "@/components/ui/radio";
import { X } from 'lucide-react';
import { AppUser } from '@/context/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface UserRequestCardProps {
  user: AppUser;
  selectedDuration: number;
  setSelectedDuration: React.Dispatch<React.SetStateAction<number>>;
  onSendRequest: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
}

const UserRequestCard: React.FC<UserRequestCardProps> = ({
  user,
  selectedDuration,
  setSelectedDuration,
  onSendRequest,
  onCancel
}) => {
  const handleDurationChange = (value: string) => {
    setSelectedDuration(parseInt(value));
  };

  // Prevent click events from reaching the map
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      
      <RadioGroup 
        value={selectedDuration.toString()} 
        onValueChange={handleDurationChange}
        className="flex gap-2 mb-4"
        onClick={stopPropagation}
      >
        <div className="flex items-center space-x-2">
          <Radio value="15" id="r1" />
          <label htmlFor="r1" className="text-sm">15 min</label>
        </div>
        <div className="flex items-center space-x-2">
          <Radio value="30" id="r2" />
          <label htmlFor="r2" className="text-sm">30 min</label>
        </div>
        <div className="flex items-center space-x-2">
          <Radio value="45" id="r3" />
          <label htmlFor="r3" className="text-sm">45 min</label>
        </div>
        <div className="flex items-center space-x-2">
          <Radio value="60" id="r4" />
          <label htmlFor="r4" className="text-sm">60 min</label>
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
          className="flex-1"
          onClick={onSendRequest}
        >
          Send Request
        </Button>
      </div>
    </Card>
  );
};

export default UserRequestCard;
