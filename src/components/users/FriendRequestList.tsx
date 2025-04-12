
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Check, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const FriendRequestList: React.FC = () => {
  const { friendRequests, setFriendRequests, chats, setChats } = useAppContext();
  const { toast } = useToast();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAccept = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    // Update request status
    setFriendRequests(
      friendRequests.map(r => 
        r.id === requestId ? { ...r, status: 'accepted' } : r
      )
    );

    // Create a chat with this user
    const newChat = {
      id: `chat-${Date.now()}`,
      participantId: request.senderId,
      participantName: request.senderName,
      profilePic: request.senderProfilePic,
      lastMessage: "Say hello!",
      lastMessageTime: Date.now(),
      messages: [],
    };

    setChats([...chats, newChat]);

    toast({
      title: "Request Accepted!",
      description: `You've accepted ${request.senderName}'s request.`,
    });
  };

  const handleReject = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    // Update request status
    setFriendRequests(
      friendRequests.map(r => 
        r.id === requestId ? { ...r, status: 'rejected' } : r
      )
    );

    toast({
      title: "Request Rejected",
      description: `You've declined ${request.senderName}'s request.`,
    });
  };

  const pendingRequests = friendRequests.filter(r => r.status === 'pending');

  if (pendingRequests.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No pending friend requests.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingRequests.map((request) => (
        <Card key={request.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={request.senderProfilePic} alt={request.senderName} />
                  <AvatarFallback>{request.senderName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{request.senderName}</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{request.duration} mins</span>
                    <span className="mx-1">•</span>
                    <span>{formatTime(request.timestamp)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => handleReject(request.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => handleAccept(request.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FriendRequestList;
