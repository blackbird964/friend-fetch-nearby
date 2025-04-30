
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import UserCard from './UserCard';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const UserList: React.FC = () => {
  const { nearbyUsers, radiusInKm, chats, setChats } = useAppContext();
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
    if (!user.location) return false;
    
    // Wynyard coordinates
    const wynyardLat = -33.8666;
    const wynyardLng = 151.2073;
    
    // Calculate distance
    const R = 6371; // Radius of the Earth in km
    const dLat = (user.location.lat - wynyardLat) * Math.PI / 180;
    const dLon = (user.location.lng - wynyardLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(wynyardLat * Math.PI / 180) * Math.cos(user.location.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance <= radiusInKm;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">People Nearby ({usersInRange.length})</h2>
        <span className="text-sm text-gray-500">Radius: {radiusInKm} km</span>
      </div>
      
      {usersInRange.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No users found nearby. Try increasing your radius.
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
