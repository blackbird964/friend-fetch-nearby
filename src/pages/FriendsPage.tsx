
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CheckInsList from '@/components/friends/CheckInsList';
import FriendsList from '@/components/friends/FriendsList';
import { Chat } from '@/context/types';
import { useChatList } from '@/hooks/useChatList';
import { useFriendships } from '@/hooks/useFriendships';

const FriendsPage: React.FC = () => {
  const { setSelectedChat, friendRequests, refreshFriendRequests } = useAppContext();
  const { chats } = useChatList();
  const { friends, isLoading: friendshipsLoading } = useFriendships();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');

  console.log("FriendsPage: Component rendered");
  console.log("FriendsPage: Friends from useFriendships:", friends);
  console.log("FriendsPage: Friends count:", friends.length);
  console.log("FriendsPage: Is loading:", friendshipsLoading);

  useEffect(() => {
    refreshFriendRequests();
  }, [refreshFriendRequests]);

  const handleFriendClick = (friend: any) => {
    console.log("FriendsPage: handleFriendClick called with:", friend);
    // Find the corresponding chat for this friend
    const friendChat = chats.find(chat => chat.participantId === friend.id);
    
    if (friendChat) {
      console.log("FriendsPage: Found chat for friend, navigating to chat");
      setSelectedChat(friendChat);
      navigate('/chat');
    } else {
      // If no chat exists, we could create one or handle this case
      console.log('FriendsPage: No chat found for friend:', friend.name);
    }
  };

  // Show loading state while friendships are being fetched
  if (friendshipsLoading) {
    console.log("FriendsPage: Showing loading state");
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
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your friends...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log("FriendsPage: Rendering main content with", friends.length, "friends");

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
