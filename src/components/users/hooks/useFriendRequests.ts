
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { FriendRequest } from '@/context/types';
import { useToast } from "@/hooks/use-toast";
import { updateFriendRequestStatus, cancelFriendRequest } from '@/services/friend-requests';
import { toast } from "sonner";

export const useFriendRequests = () => {
  const { currentUser, friendRequests, setFriendRequests, chats, setChats, refreshFriendRequests } = useAppContext();
  const [loading, setLoading] = useState(false);

  // Filter to show pending requests and requests sent by current user
  const pendingRequests = friendRequests.filter(r => 
    r.status === 'pending' && r.receiverId === currentUser?.id
  );
  
  const sentRequests = friendRequests.filter(r => 
    r.status === 'pending' && r.senderId === currentUser?.id
  );

  const handleAccept = async (requestId: string) => {
    if (!currentUser) return;
    
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    setLoading(true);
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

        // Check if we already have a chat with this user
        const existingChat = chats.find(chat => 
          chat.participantId === request.senderId || 
          chat.participants.includes(request.senderId)
        );

        if (!existingChat) {
          // Create a chat with this user if one doesn't exist
          const newChat = {
            id: `chat-${Date.now()}`,
            participantId: request.senderId || '',
            participantName: request.senderName || request.sender_name || 'User',
            profilePic: request.senderProfilePic || '',
            lastMessage: "Say hello!",
            lastMessageTime: Date.now(),
            messages: [],
            name: request.senderName || request.sender_name || 'User',
            participants: [currentUser.id || '', request.senderId || ''],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            unreadCount: 0
          };

          setChats([...chats, newChat]);
        }

        toast.success("Request Accepted", {
          description: `You've accepted ${request.senderName || request.sender_name}'s request.`,
        });
        
        // Refresh friend requests to get the latest data
        await refreshFriendRequests();
      } else {
        throw new Error("Failed to update request status");
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error("Error", {
        description: "Failed to accept request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    setLoading(true);
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

        toast.success("Request Rejected", {
          description: `You've declined ${request.senderName || request.sender_name}'s request.`,
        });
        
        // Refresh friend requests to get the latest data
        await refreshFriendRequests();
      } else {
        throw new Error("Failed to update request status");
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error("Error", {
        description: "Failed to reject request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    setLoading(true);
    try {
      const success = await cancelFriendRequest(requestId);
      
      if (success) {
        // Remove the request from state
        setFriendRequests(friendRequests.filter(r => r.id !== requestId));
        
        toast.success("Request Cancelled", {
          description: "Your catch-up request has been cancelled.",
        });
        
        // Refresh friend requests to get the latest data
        await refreshFriendRequests();
      } else {
        throw new Error("Failed to cancel request");
      }
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      toast.error("Error", {
        description: "Failed to cancel request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    pendingRequests,
    sentRequests,
    handleAccept,
    handleReject,
    handleCancel,
    loading
  };
};
