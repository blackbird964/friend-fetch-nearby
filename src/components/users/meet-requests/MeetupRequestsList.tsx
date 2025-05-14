
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { MeetupRequest } from '@/context/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Check, X } from 'lucide-react';
import { useMeetupRequests } from '../hooks/useMeetupRequests';
import { formatTime } from '@/utils/requestUtils';

const MeetupRequestsList: React.FC = () => {
  const { currentUser, meetupRequests } = useAppContext();
  const { handleAccept, handleReject } = useMeetupRequests();

  // Filter to show pending meetup requests where current user is receiver
  const pendingRequests = meetupRequests.filter(r => 
    r.status === 'pending' && r.receiverId === currentUser?.id
  );
  
  // Filter to show sent meetup requests where current user is sender
  const sentRequests = meetupRequests.filter(r => 
    r.status === 'pending' && r.senderId === currentUser?.id
  );

  // Get initials for avatar fallback
  const getInitials = (name: string = 'User') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (pendingRequests.length === 0 && sentRequests.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No pending meetup requests.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Meetup Requests</h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-3 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar>
                    <AvatarImage src={request.senderProfilePic || undefined} />
                    <AvatarFallback>{getInitials(request.senderName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.senderName}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{request.duration} minute meetup</span>
                    </div>
                    {request.meetLocation && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>at {request.meetLocation}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      {request.timestamp ? formatTime(request.timestamp) : ''}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    className="flex items-center" 
                    onClick={() => handleAccept(request.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleReject(request.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent requests */}
      {sentRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Sent Meetup Requests</h3>
          <div className="space-y-2">
            {sentRequests.map((request) => (
              <div key={request.id} className="p-3 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar>
                    <AvatarImage src={request.receiverProfilePic || undefined} />
                    <AvatarFallback>{getInitials(request.receiverName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.receiverName}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{request.duration} minute meetup</span>
                    </div>
                    {request.meetLocation && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>at {request.meetLocation}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      {request.timestamp ? formatTime(request.timestamp) : ''}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-amber-600">Awaiting response</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetupRequestsList;
