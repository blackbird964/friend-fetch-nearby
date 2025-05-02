
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Check, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { updateFriendRequestStatus } from '@/services/friendRequestService';

const FriendRequestList: React.FC = () => {
  const { friendRequests, setFriendRequests, chats, setChats } = useAppContext();
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

  const pendingRequests = friendRequests.filter(r => r.status === 'pending');

  if (pendingRequests.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No pending friend requests.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingRequests.map((request) => (
        <div key={request.id} className="border rounded-lg overflow-hidden bg-white">
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
                    <span>{formatTime(request.timestamp)}</span>
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
  );
};

export default FriendRequestList;
