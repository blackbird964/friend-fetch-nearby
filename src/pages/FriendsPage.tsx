
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';
import UserCard from '@/components/users/UserCard';
import { Chat } from '@/context/types';
import { Separator } from '@/components/ui/separator';

const FriendsPage: React.FC = () => {
  const { chats, setSelectedChat } = useAppContext();
  const navigate = useNavigate();

  // Extract friends from chats
  const friends = chats.map(chat => ({
    id: chat.participantId,
    name: chat.participantName,
    profile_pic: chat.profilePic,
    isOnline: chat.isOnline,
    chat: chat
  }));

  const handleFriendClick = (chat: Chat) => {
    setSelectedChat(chat);
    navigate('/chat');
  };

  return (
    <div className="container mx-auto px-4 py-6 mb-20 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full" 
          onClick={() => navigate('/home')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Friends</h1>
      </div>

      {friends.length > 0 ? (
        <div className="space-y-4">
          {friends.map((friend) => (
            <div 
              key={friend.id}
              className="border rounded-lg p-4 bg-white cursor-pointer hover:bg-gray-50"
              onClick={() => handleFriendClick(friend.chat)}
            >
              <UserCard user={friend} minimal={false} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No friends yet</h3>
          <p className="text-gray-500 mb-6">
            Find people nearby and send friend requests to connect
          </p>
          <Button onClick={() => navigate('/map')}>
            Find Friends
          </Button>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
