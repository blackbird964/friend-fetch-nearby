
import React from 'react';
import { FriendRequest } from '@/context/types';
import { Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 px-1">Sent Requests</h3>
      <div className="space-y-2">
        {requests.map((request) => (
          <Card key={request.id} className="p-4 bg-gray-50 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <UserAvatar
                  src={request.receiverProfilePic}
                  alt={request.receiverName || 'User'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {request.receiverName || 'User'}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    <span className="mr-2">{request.duration} mins</span>
                    <span className="mr-2">{request.timestamp ? formatTime(request.timestamp) : ''}</span>
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                      Pending
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onCancel(request.id)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 ml-3"
              >
                Cancel
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SentRequests;
