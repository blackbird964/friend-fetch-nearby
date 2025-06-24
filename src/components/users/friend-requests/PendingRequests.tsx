
import React from 'react';
import { FriendRequest } from '@/context/types';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
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
  console.log("PendingRequests: Rendering with requests:", requests);
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-3">
          <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">No incoming friend requests</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 bg-blue-500 rounded-full"></div>
        <h3 className="text-sm font-semibold text-gray-900">Incoming Requests</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {requests.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {requests.map((request) => (
          <Card key={request.id} className="p-3 bg-blue-50/50 border-blue-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <UserAvatar
                  src={request.senderProfilePic}
                  alt={request.senderName || 'User'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate text-sm">
                    {request.senderName || 'User'}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    <span className="mr-2">{request.duration} mins</span>
                    <span>{request.timestamp ? formatTime(request.timestamp) : ''}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0 border-red-200 hover:border-red-300 hover:bg-red-50" 
                  onClick={() => onReject(request.id)}
                >
                  <XCircle className="h-4 w-4 text-red-500" />
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0 bg-green-500 hover:bg-green-600 border-0" 
                  onClick={() => onAccept(request.id)}
                >
                  <CheckCircle className="h-4 w-4 text-white" />
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
