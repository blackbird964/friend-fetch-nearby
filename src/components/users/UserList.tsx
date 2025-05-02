import React from 'react';
import { useAppContext } from '@/context/AppContext';
import UserCard from './UserCard';
import { Button } from '@/components/ui/button';
import { MessageCircle, RefreshCw, MapPin, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Chat } from '@/context/types';
import { sendFriendRequest } from '@/services/friendRequestService';

const UserList: React.FC = () => {
  const { nearbyUsers, radiusInKm, chats, setChats, currentUser, refreshNearbyUsers, loading, setSelectedChat, friendRequests, setFriendRequests } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const startChat = (user: any) => {
    if (!currentUser) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to chat",
        variant: "destructive"
      });
      return;
    }
    
    // Check if chat already exists
    const existingChat = chats.find(chat => chat.participantId === user.id);
    
    if (existingChat) {
      setSelectedChat(existingChat);
      toast({
        title: "Chat exists",
        description: `Opening your chat with ${user.name}`,
      });
    } else {
      // Create new chat with required properties
      const newChat: Chat = {
        id: `chat-${user.id}`,
        name: user.name || 'Chat',
        participants: [currentUser.id, user.id],
        participantId: user.id,
        participantName: user.name,
        profilePic: user.profile_pic || '',
        lastMessage: "Start chatting now",
        lastMessageTime: Date.now(),
        messages: [],
      };
      
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
      
      toast({
        title: "Chat created",
        description: `Started a new chat with ${user.name}`,
      });
    }
    
    // Navigate to chat page
    navigate('/chat');
  };

  const handleRefresh = async () => {
    try {
      await refreshNearbyUsers(true);
      toast({
        title: "Refreshed",
        description: "Nearby users list has been updated.",
      });
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast({
        title: "Error",
        description: "Failed to refresh nearby users.",
        variant: "destructive"
      });
    }
  };

  // Function to handle sending friend request
  const handleAddFriend = async (user: any) => {
    if (!currentUser) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to send friend requests",
        variant: "destructive"
      });
      return;
    }

    // Check if we already have a pending request with this user
    const existingRequest = friendRequests.find(req => 
      req.status === 'pending' && 
      ((req.receiverId === user.id && req.senderId === currentUser.id) ||
       (req.senderId === user.id && req.receiverId === currentUser.id))
    );

    if (existingRequest) {
      toast({
        title: "Request already sent",
        description: `You already have a pending request with ${user.name}`,
        variant: "default"
      });
      return;
    }

    try {
      // Use the default 30 minutes duration
      const defaultDuration = 30;
      const request = await sendFriendRequest(
        currentUser.id,
        currentUser.name || 'User',
        currentUser.profile_pic,
        user.id,
        user.name || 'User',
        user.profile_pic,
        defaultDuration
      );
      
      if (request) {
        setFriendRequests([...friendRequests, request]);
        
        toast({
          title: "Friend Request Sent!",
          description: `You've sent a friend request to ${user.name}`,
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">People Nearby ({nearbyUsers.length})</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Radius: {radiusInKm} km</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {nearbyUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No users found nearby. Try increasing your radius or refreshing.</p>
          {!currentUser?.location && (
            <p className="text-sm text-amber-600">Enable location access to find people near you.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {nearbyUsers.map((user) => (
            <div key={user.id} className="border rounded-lg overflow-hidden">
              <UserCard user={user} />
              <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
                {!user.location && (
                  <div className="text-xs text-amber-600 flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>User hasn't shared their location yet</span>
                  </div>
                )}
                <div className="flex gap-2 w-full">
                  <Button 
                    className="w-1/2" 
                    onClick={() => handleAddFriend(user)}
                    variant="default"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                  <Button 
                    className="w-1/2" 
                    onClick={() => startChat(user)}
                    variant="outline"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
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

export default UserList;
