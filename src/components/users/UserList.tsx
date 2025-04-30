
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import UserCard from './UserCard';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const UserList: React.FC = () => {
  const { nearbyUsers, radiusInKm, chats, setChats, currentUser } = useAppContext();
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

  // Calculate which users are within the radius
  const usersInRange = nearbyUsers.filter(user => {
    // Users already come with distance info from the context
    return true; // All users in nearbyUsers are already filtered by radius
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">People Nearby ({usersInRange.length})</h2>
        <span className="text-sm text-gray-500">Radius: {radiusInKm} km</span>
      </div>
      
      {usersInRange.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No users found nearby. Try increasing your radius or refreshing.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {usersInRange.map((user) => (
            <div key={user.id} className="border rounded-lg overflow-hidden">
              <UserCard user={user} />
              <div className="px-4 pb-4 pt-1">
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
