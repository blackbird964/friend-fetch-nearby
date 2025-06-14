
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CheckInsList from '@/components/friends/CheckInsList';
import FriendsList from '@/components/friends/FriendsList';
import { Chat, AppUser } from '@/context/types';
import { useChatList } from '@/hooks/useChatList';

const FriendsPage: React.FC = () => {
  const { setSelectedChat, friendRequests, refreshFriendRequests } = useAppContext();
  const { chats, isLoading } = useChatList();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    refreshFriendRequests();
  }, [refreshFriendRequests]);

  // Extract real friends from chats - include ALL chats as friends
  // regardless of check-in status, but deduplicate by participant ID
  const friends = React.useMemo(() => {
    if (!chats || chats.length === 0) return [];
    
    return chats.reduce((uniqueFriends: AppUser[], chat) => {
      const participantId = chat.participantId || '';
      
      // Skip if no participant ID
      if (!participantId) return uniqueFriends;
      
      // Check if we already have this friend
      const existingFriend = uniqueFriends.find(friend => friend.id === participantId);
      
      if (!existingFriend) {
        const friend: AppUser = {
          id: participantId,
          name: chat.participantName || '',
          email: '',
          interests: [],
          profile_pic: chat.profilePic,
          isOnline: chat.isOnline,
          chat: chat
        };
        
        uniqueFriends.push(friend);
      } else {
        // Update with the most recent chat data if this chat is newer
        if (chat.lastMessageTime && (!existingFriend.chat?.lastMessageTime || chat.lastMessageTime > existingFriend.chat.lastMessageTime)) {
          existingFriend.chat = chat;
          existingFriend.isOnline = chat.isOnline;
          existingFriend.profile_pic = chat.profilePic;
          existingFriend.name = chat.participantName || existingFriend.name;
        }
      }
      
      return uniqueFriends;
    }, []);
  }, [chats]);

  const handleFriendClick = (chat: Chat) => {
    setSelectedChat(chat);
    navigate('/chat');
  };

  // Show loading state while chats are being fetched
  if (isLoading) {
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
