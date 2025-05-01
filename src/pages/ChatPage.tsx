
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import FriendRequestList from '@/components/users/FriendRequestList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';

const ChatPage: React.FC = () => {
  const { friendRequests, selectedChat, setSelectedChat, loading } = useAppContext();
  const isMobile = useIsMobile();
  
  const pendingRequests = friendRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl flex flex-col h-[calc(100vh-130px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        {selectedChat && isMobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center" 
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
      
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
          {/* On mobile: Show chat list when no chat is selected, hide when viewing a chat */}
          {(!selectedChat || !isMobile) && (
            <div className={`${isMobile ? 'h-full' : 'md:w-1/3'} overflow-hidden flex-shrink-0`}>
              <div className="border rounded-lg bg-background shadow-sm h-full overflow-hidden">
                <ChatList />
              </div>
            </div>
          )}
          
          {/* Show the chat window if a chat is selected */}
          {selectedChat && (
            <div className={`${isMobile ? 'h-full' : 'md:w-2/3'} flex-grow overflow-hidden`}>
              <div className="border rounded-lg h-full bg-background shadow-sm flex flex-col">
                <ChatWindow />
              </div>
            </div>
          )}
          
          {/* Show a placeholder if no chat is selected (desktop only) */}
          {!selectedChat && !isMobile && (
            <div className="hidden md:flex md:w-2/3 md:items-center md:justify-center h-full">
              <div className="border rounded-lg h-full w-full bg-background shadow-sm flex flex-col items-center justify-center text-gray-500">
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
