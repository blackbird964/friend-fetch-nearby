
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CheckInsList from '@/components/friends/CheckInsList';
import FriendsList from '@/components/friends/FriendsList';
import { Chat, AppUser } from '@/context/types';

const FriendsPage: React.FC = () => {
  const { chats, setSelectedChat, friendRequests, refreshFriendRequests } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    refreshFriendRequests();
  }, [refreshFriendRequests]);

  // Extract real friends from chats
  const friends = chats.map(chat => {
    const friend: AppUser = {
      id: chat.participantId || '',
      name: chat.participantName || '',
      email: '',
      interests: [],
      profile_pic: chat.profilePic,
      isOnline: chat.isOnline,
      chat: chat
    };
    
    return friend;
  }).filter(friend => friend.id !== '');

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Friends
          </TabsTrigger>
          <TabsTrigger value="checkins" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Check-ins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          <FriendsList 
            friends={friends}
            onFriendClick={handleFriendClick}
            onFindFriends={() => navigate('/map')}
          />
        </TabsContent>

        <TabsContent value="checkins" className="mt-6">
          <CheckInsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendsPage;
