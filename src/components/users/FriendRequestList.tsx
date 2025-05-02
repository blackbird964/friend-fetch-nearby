
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Check, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { updateFriendRequestStatus, cancelFriendRequest } from '@/services/friendRequestService';

const FriendRequestList: React.FC = () => {
  const { currentUser, friendRequests, setFriendRequests, chats, setChats } = useAppContext();
  const { toast } = useToast();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAccept = async (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      // Update request status on the backend
      const success = await updateFriendRequestStatus(requestId, 'accepted');
      
      if (success) {
        // Update request status in local state
        setFriendRequests(
          friendRequests.map(r => 
            r.id === requestId ? { ...r, status: 'accepted' } : r
          )
        );

        // Create a chat with this user
        const newChat = {
          id: `chat-${Date.now()}`,
          participantId: request.senderId || '',
          participantName: request.senderName || 'User',
          profilePic: request.senderProfilePic || '',
          lastMessage: "Say hello!",
          lastMessageTime: Date.now(),
          messages: [],
          name: request.senderName || 'User',
          participants: [currentUser?.id || '', request.senderId || '']
        };

        setChats([...chats, newChat]);

        toast({
          title: "Request Accepted!",
          description: `You've accepted ${request.senderName}'s request.`,
        });
      } else {
        throw new Error("Failed to update request status");
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      // Update request status on the backend
      const success = await updateFriendRequestStatus(requestId, 'rejected');
      
      if (success) {
        // Update request status in local state
        setFriendRequests(
          friendRequests.map(r => 
            r.id === requestId ? { ...r, status: 'rejected' } : r
          )
        );

        toast({
          title: "Request Rejected",
          description: `You've declined ${request.senderName}'s request.`,
        });
      } else {
        throw new Error("Failed to update request status");
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      const success = await cancelFriendRequest(requestId);
      
      if (success) {
        // Remove the request from state
        setFriendRequests(friendRequests.filter(r => r.id !== requestId));
        
        toast({
          title: "Request Cancelled",
          description: "Your catch-up request has been cancelled.",
        });
      } else {
        throw new Error("Failed to cancel request");
      }
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel request. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter to show pending requests and requests sent by current user
  const pendingRequests = friendRequests.filter(r => 
    r.status === 'pending' && r.receiverId === currentUser?.id
  );
  
  const sentRequests = friendRequests.filter(r => 
    r.status === 'pending' && r.senderId === currentUser?.id
  );

  if (pendingRequests.length === 0 && sentRequests.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No pending friend requests.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingRequests.length > 0 && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Requests received</h3>
          {pendingRequests.map((request) => (
            <div key={request.id} className="border rounded-lg overflow-hidden bg-white mb-3">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={request.senderProfilePic || ''} alt={request.senderName || 'User'} />
                      <AvatarFallback>{request.senderName ? request.senderName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
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
                      onClick={() => handleReject(request.id)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-10 w-10 rounded-full p-0 bg-primary" 
                      onClick={() => handleAccept(request.id)}
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {sentRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Requests sent</h3>
          {sentRequests.map((request) => (
            <div key={request.id} className="border rounded-lg overflow-hidden bg-white mb-3">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={request.receiverProfilePic || ''} alt={request.receiverName || 'User'} />
                      <AvatarFallback>{request.receiverName ? request.receiverName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
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
                    onClick={() => handleCancel(request.id)}
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequestList;
