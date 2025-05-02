
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from 'lucide-react';
import UserCard from '@/components/users/UserCard';
import { AppUser } from '@/context/types';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { sendFriendRequest } from '@/services/friendRequestService';

interface UserRequestCardProps {
  user: AppUser;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
  onSendRequest: () => void;
  onCancel: () => void;
}

const UserRequestCard: React.FC<UserRequestCardProps> = ({
  user,
  selectedDuration,
  setSelectedDuration,
  onSendRequest,
  onCancel
}) => {
  const { currentUser, friendRequests, setFriendRequests } = useAppContext();
  const { toast } = useToast();
  const availableTimes = [15, 30, 45, 60];
  
  const handleSendRequest = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to send friend requests",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const request = await sendFriendRequest(
        currentUser.id,
        currentUser.name || 'User',
        currentUser.profile_pic,
        user.id,
        user.name || 'User',
        user.profile_pic,
        selectedDuration
      );
      
      if (request) {
        setFriendRequests([...friendRequests, request]);
        
        toast({
          title: "Request Sent!",
          description: `You've sent a ${selectedDuration} minute meet-up request to ${user.name}`,
        });
        
        onSendRequest();
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="mt-4 shadow-md animate-slide-in-bottom">
      <CardContent className="p-4">
        <div className="flex flex-col">
          <UserCard user={user} minimal={true} />
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center">
                <Clock className="mr-1 h-4 w-4 text-primary" />
                Meet for:
              </h4>
            </div>
            <div className="flex space-x-2 mb-4">
              {availableTimes.map(time => (
                <Button
                  key={time}
                  variant={selectedDuration === time ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSelectedDuration(time)}
                >
                  {time} min
                </Button>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleSendRequest}
              >
                Send Request
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRequestCard;
