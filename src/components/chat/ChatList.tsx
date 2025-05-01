
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format, isToday, isYesterday } from 'date-fns';
import { getProfile } from '@/lib/supabase';
import { Chat } from '@/context/types';
import { supabase } from '@/integrations/supabase/client';

const ChatList: React.FC = () => {
  const { chats, setChats, setSelectedChat, selectedChat, currentUser } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch chats for current user when component mounts
  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        
        // Get all messages involving the current user
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }
        
        if (!messages || messages.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Group messages by the other participant
        const chatParticipants = new Set<string>();
        messages.forEach(msg => {
          const participantId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
          chatParticipants.add(participantId);
        });
        
        // Fetch profiles for all participants
        const participants = Array.from(chatParticipants);
        const chatsList: Chat[] = [];
        
        // Create a chat object for each participant
        for (const participantId of participants) {
          // Get the profile for this participant
          const profile = await getProfile(participantId);
          
          if (profile) {
            // Find the latest message with this participant
            const latestMessage = messages.find(msg => 
              msg.sender_id === participantId || msg.receiver_id === participantId
            );
            
            if (latestMessage) {
              // Create a chat object
              chatsList.push({
                id: `chat-${participantId}`,
                participantId: participantId,
                participantName: profile.name || 'Anonymous',
                profilePic: profile.profile_pic || '',
                lastMessage: latestMessage.content,
                lastMessageTime: new Date(latestMessage.created_at).getTime(),
                messages: [], // Messages will be loaded when chat is selected
              });
            }
          }
        }
        
        // Sort chats by latest message
        chatsList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        
        // Update the chats state
        setChats(chatsList);
      } catch (err) {
        console.error('Error loading chats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [currentUser]);

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <p>Loading chats...</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
        <p>No chats yet</p>
        <p className="text-sm">Accept a friend request to start chatting</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {chats.map((chat) => (
        <button
          key={chat.id}
          className={`flex items-center w-full p-4 text-left transition-colors ${
            selectedChat?.id === chat.id
              ? 'bg-primary/10'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => setSelectedChat(chat)}
        >
          <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
            <AvatarImage src={chat.profilePic} alt={chat.participantName} />
            <AvatarFallback>{chat.participantName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium truncate">{chat.participantName}</h3>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">
                {formatMessageTime(chat.lastMessageTime)}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatList;
