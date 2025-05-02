
import React from 'react';
import { FriendRequest } from '@/context/types';
import { Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import UserAvatar from '../cards/UserAvatar';
import { formatTime } from '@/utils/requestUtils';

interface SentRequestsProps {
  requests: FriendRequest[];
  onCancel: (requestId: string) => void;
}

const SentRequests: React.FC<SentRequestsProps> = ({ 
  requests, 
  onCancel 
}) => {
  if (requests.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-2">Requests sent</h3>
      {requests.map((request) => (
        <div key={request.id} className="border rounded-lg overflow-hidden bg-white mb-3">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserAvatar
                  src={request.receiverProfilePic}
                  alt={request.receiverName || 'User'}
                />
                <div>
                  <h4 className="font-medium">{request.receiverName || 'User'}</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{request.duration} mins</span>
                    <span className="mx-1">•</span>
                    <span>{request.timestamp ? formatTime(request.timestamp) : ''}</span>
                    <span className="ml-2 text-amber-600">Pending</span>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onCancel(request.id)}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SentRequests;
