
import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import FriendRequestList from '@/components/users/FriendRequestList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ChatPage: React.FC = () => {
  const { friendRequests, selectedChat, setSelectedChat } = useAppContext();
  
  const pendingRequests = friendRequests.filter(r => r.status === 'pending').length;

  // Clear selected chat when navigating away or on mobile devices
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && selectedChat) {
        setSelectedChat(null);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedChat, setSelectedChat]);

  // Force clear selected chat on page load for mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSelectedChat(null);
    }
  }, [setSelectedChat]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl flex flex-col h-[calc(100vh-130px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        {selectedChat && window.innerWidth < 768 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden flex items-center" 
            onClick={() => setSelectedChat(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to chats
          </Button>
        )}
      </div>
      
      {pendingRequests > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                Friend Requests
              </CardTitle>
              <span className="bg-primary text-white text-sm font-medium py-1 px-2 rounded-full">
                {pendingRequests} new
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <FriendRequestList />
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow overflow-hidden">
        <div className={`md:col-span-1 ${selectedChat ? 'hidden md:block' : 'block'}`}>
          <ChatList />
        </div>
        <div className={`md:col-span-2 ${selectedChat ? 'block' : 'hidden md:block'} h-full`}>
          <div className="border rounded-lg h-full bg-background shadow-sm flex flex-col">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
