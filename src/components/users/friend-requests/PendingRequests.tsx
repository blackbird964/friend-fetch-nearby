
import React from 'react';
import { FriendRequest } from '@/context/types';
import { Clock, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import UserAvatar from '../cards/UserAvatar';
import { formatTime } from '@/utils/requestUtils';

interface PendingRequestsProps {
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const PendingRequests: React.FC<PendingRequestsProps> = ({ 
  requests,
  onAccept, 
  onReject
}) => {
  if (requests.length === 0) return null;
  
  return (
    <div className="mb-3">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Requests received</h3>
      {requests.map((request) => (
        <div key={request.id} className="border rounded-lg overflow-hidden bg-white mb-3">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserAvatar
                  src={request.senderProfilePic}
                  alt={request.senderName || 'User'}
                />
                <div>
                  <h4 className="font-medium">{request.senderName || 'User'}</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{request.duration} mins</span>
                    <span className="mx-1">•</span>
                    <span>{request.timestamp ? formatTime(request.timestamp) : ''}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 w-10 rounded-full p-0" 
                  onClick={() => onReject(request.id)}
                >
                  <X className="h-5 w-5" />
                </Button>
                <Button 
                  size="sm" 
                  className="h-10 w-10 rounded-full p-0 bg-primary" 
                  onClick={() => onAccept(request.id)}
                >
                  <Check className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingRequests;
