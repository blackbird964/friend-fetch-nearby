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

  // We'll keep the selectedChat handling for desktop mode only
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && selectedChat) {
        // We're not clearing the selected chat anymore on resize
        // This keeps the chat selected even on mobile
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedChat, setSelectedChat]);

  // We'll also modify this to not force clear on page load for mobile
  useEffect(() => {
    // Removed the forced clearing of selected chat on mobile
  }, [setSelectedChat]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl flex flex-col h-[calc(100vh-130px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        {selectedChat && (
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
        {/* Always show the chat list, regardless of whether a chat is selected */}
        <div className="md:col-span-1 block h-full overflow-y-auto">
          <div className="border rounded-lg bg-background shadow-sm h-full">
            <ChatList />
          </div>
        </div>
        
        {/* Show the chat window if a chat is selected */}
        {selectedChat && (
          <div className="md:col-span-2 h-full">
            <div className="border rounded-lg h-full bg-background shadow-sm flex flex-col">
              <ChatWindow />
            </div>
          </div>
        )}
        
        {/* Show a placeholder if no chat is selected (desktop only) */}
        {!selectedChat && (
          <div className="md:col-span-2 hidden md:flex md:items-center md:justify-center h-full">
            <div className="border rounded-lg h-full bg-background shadow-sm flex flex-col items-center justify-center text-gray-500">
              <p>Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
