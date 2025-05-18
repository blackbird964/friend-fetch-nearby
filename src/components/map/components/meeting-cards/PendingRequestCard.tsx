
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { AppUser, FriendRequest } from '@/context/types';
import { useToast } from '@/hooks/use-toast';

interface PendingRequestCardProps {
  user: AppUser;
  existingRequest: FriendRequest;
  onCancelRequest: (request: FriendRequest, e: React.MouseEvent) => void;
  stopPropagation: (e: React.MouseEvent) => void;
}

const PendingRequestCard: React.FC<PendingRequestCardProps> = ({
  user,
  existingRequest,
  onCancelRequest,
  stopPropagation
}) => {
  return (
    <div 
      className="mt-4 p-4 bg-white border rounded-lg shadow-md animate-fade-in user-popup-card"
      onClick={stopPropagation}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Active Catch-up Request</h3>
        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
          Pending
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        You already have a pending catch-up request with {user.name} for {existingRequest.duration} minutes.
      </p>
      
      <Button 
        variant="destructive"
        className="w-full flex items-center justify-center"
        onClick={(e) => onCancelRequest(existingRequest, e)}
      >
        <X className="mr-2 h-4 w-4" />
        Cancel Request
      </Button>
    </div>
  );
};

export default PendingRequestCard;
