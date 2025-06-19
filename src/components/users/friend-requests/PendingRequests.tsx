
import React from 'react';
import { FriendRequest } from '@/context/types';
import { Clock, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 px-1">Pending Requests</h3>
      <div className="space-y-2">
        {requests.map((request) => (
          <Card key={request.id} className="p-4 bg-white shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <UserAvatar
                  src={request.senderProfilePic}
                  alt={request.senderName || 'User'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {request.senderName || 'User'}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    <span className="mr-2">{request.duration} mins</span>
                    <span>{request.timestamp ? formatTime(request.timestamp) : ''}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0 border-gray-300 hover:border-red-300 hover:bg-red-50" 
                  onClick={() => onReject(request.id)}
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0 bg-green-600 hover:bg-green-700" 
                  onClick={() => onAccept(request.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PendingRequests;
