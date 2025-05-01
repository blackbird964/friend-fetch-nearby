
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from 'lucide-react';
import UserCard from '@/components/users/UserCard';
import { AppUser } from '@/context/types';

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
  const availableTimes = [15, 30, 45, 60];
  
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
                onClick={onSendRequest}
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
