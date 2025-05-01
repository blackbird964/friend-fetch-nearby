
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import UserCard from './UserCard';
import { Button } from '@/components/ui/button';
import { MessageCircle, RefreshCw, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const UserList: React.FC = () => {
  const { nearbyUsers, radiusInKm, chats, setChats, currentUser, refreshNearbyUsers, loading } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const startChat = (user: any) => {
    // Check if chat already exists
    const existingChat = chats.find(chat => chat.participantId === user.id);
    
    if (existingChat) {
      toast({
        title: "Chat exists",
        description: `You already have a chat with ${user.name}. Opening existing chat.`,
      });
    } else {
      // Create new chat
      const newChat = {
        id: `chat-${Date.now()}`,
        participantId: user.id,
        participantName: user.name,
        profilePic: user.profile_pic,
        lastMessage: "Say hello!",
        lastMessageTime: Date.now(),
        messages: [],
      };
      
      setChats([...chats, newChat]);
      
      toast({
        title: "Chat created",
        description: `New chat started with ${user.name}`,
      });
    }
    
    // Navigate to chat page
    navigate('/chat');
  };

  const handleRefresh = async () => {
    try {
      await refreshNearbyUsers();
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

  // Get all users, whether they have location data or not
  // This ensures we'll see users even if they don't have precise location
  const allUsers = nearbyUsers;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">People Nearby ({allUsers.length})</h2>
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
      
      {allUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No users found nearby. Try increasing your radius or refreshing.</p>
          {!currentUser?.location && (
            <p className="text-sm text-amber-600">Enable location access to find people near you.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {allUsers.map((user) => (
            <div key={user.id} className="border rounded-lg overflow-hidden">
              <UserCard user={user} />
              <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
                {!user.location && (
                  <div className="text-xs text-amber-600 flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>User hasn't shared their location yet</span>
                  </div>
                )}
                <Button 
                  className="w-full" 
                  onClick={() => startChat(user)}
                  variant="outline"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with {user.name}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
