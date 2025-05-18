
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { AppUser } from '@/context/types';
import { useToast } from '@/hooks/use-toast';

interface ActiveMeetingCardProps {
  user: AppUser;
  isMoving: boolean;
  onCancel: (e: React.MouseEvent) => void;
  stopPropagation: (e: React.MouseEvent) => void;
}

const ActiveMeetingCard: React.FC<ActiveMeetingCardProps> = ({
  user,
  isMoving,
  onCancel,
  stopPropagation
}) => {
  return (
    <div 
      className="mt-4 p-4 bg-white border rounded-lg shadow-md animate-fade-in user-popup-card"
      onClick={stopPropagation}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Active Meeting</h3>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          {isMoving ? 'In Progress' : 'At Destination'}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        {isMoving 
          ? `${user.name} is currently heading to the meeting point.` 
          : `${user.name} has arrived at the meeting point.`}
      </p>
      
      <Button 
        variant="destructive"
        className="w-full flex items-center justify-center"
        onClick={onCancel}
      >
        <X className="mr-2 h-4 w-4" />
        Cancel Meeting
      </Button>
    </div>
  );
};

export default ActiveMeetingCard;
