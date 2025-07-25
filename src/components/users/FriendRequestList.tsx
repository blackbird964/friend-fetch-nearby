
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
      console.log("FriendRequestList: Refreshing friend requests for user:", currentUser.id);
      refreshFriendRequests();
    }
  }, [currentUser, refreshFriendRequests]);

  const handleAcceptRequest = (requestId: string) => {
    const request = pendingRequests.find(req => req.id === requestId);
    if (request) {
      console.log("FriendRequestList: Accepting request from:", request.senderName);
      handleAccept(requestId, request.senderId);
    }
  };

  console.log("FriendRequestList: Pending requests:", pendingRequests);
  console.log("FriendRequestList: Sent requests:", sentRequests);

  // Show requests if there are any, otherwise show empty state
  const hasPendingRequests = pendingRequests.length > 0;
  const hasSentRequests = sentRequests.length > 0;
  const hasAnyRequests = hasPendingRequests || hasSentRequests;

  return (
    <div className="space-y-6">
      {/* Always show incoming requests section */}
      <PendingRequests
        requests={pendingRequests}
        onAccept={handleAcceptRequest}
        onReject={handleReject}
      />
      
      {/* Only show sent requests if there are any */}
      {hasSentRequests && (
        <SentRequests
          requests={sentRequests}
          onCancel={handleCancel}
        />
      )}
      
      {/* Show empty state only if no requests at all */}
      {!hasAnyRequests && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No friend requests</h3>
          <p className="text-sm text-gray-500 px-4">When you send or receive friend requests, they'll appear here.</p>
        </div>
      )}
    </div>
  );
};

export default FriendRequestList;
