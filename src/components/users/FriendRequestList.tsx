
import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import PendingRequests from './friend-requests/PendingRequests';
import SentRequests from './friend-requests/SentRequests';
import { useFriendRequests } from './hooks/useFriendRequests';

const FriendRequestList: React.FC = () => {
  const { currentUser, refreshFriendRequests } = useAppContext();
  const { 
    pendingRequests, 
    sentRequests, 
    handleAccept, 
    handleReject, 
    handleCancel 
  } = useFriendRequests();

  // Refresh friend requests when component mounts
  useEffect(() => {
    if (currentUser) {
      refreshFriendRequests();
    }
  }, [currentUser]);

  if (pendingRequests.length === 0 && sentRequests.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No pending friend requests.
      </div>
    );
  }

  // Create wrapper function to match expected signature
  const handleAcceptRequest = (requestId: string) => {
    const request = pendingRequests.find(req => req.id === requestId);
    if (request) {
      handleAccept(requestId, request.senderId);
    }
  };

  return (
    <div className="space-y-3">
      <PendingRequests 
        requests={pendingRequests} 
        onAccept={handleAcceptRequest} 
        onReject={handleReject}
      />
      
      <SentRequests 
        requests={sentRequests} 
        onCancel={handleCancel} 
      />
    </div>
  );
};

export default FriendRequestList;
