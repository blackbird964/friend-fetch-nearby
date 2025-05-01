
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { getConversation, sendMessage, markMessagesAsRead } from '@/lib/supabase';

const ChatWindow: React.FC = () => {
  const { selectedChat, setSelectedChat, chats, setChats, currentUser } = useAppContext();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch conversation when selected chat changes
  useEffect(() => {
    const fetchConversation = async () => {
      if (!selectedChat || !currentUser) return;
      
      setIsLoading(true);
      try {
        // Fetch messages from the database
        const dbMessages = await getConversation(selectedChat.participantId);
        
        if (dbMessages.length > 0) {
          // Transform database messages to our app format
          const formattedMessages = dbMessages.map(dbMsg => ({
            id: dbMsg.id,
            senderId: dbMsg.sender_id === currentUser.id ? 'current' : selectedChat.participantId,
            text: dbMsg.content,
            timestamp: new Date(dbMsg.created_at).getTime(),
          }));
          
          // Mark unread messages as read
          const unreadMessageIds = dbMessages
            .filter(msg => !msg.read && msg.receiver_id === currentUser.id)
            .map(msg => msg.id);
            
          if (unreadMessageIds.length > 0) {
            markMessagesAsRead(unreadMessageIds);
          }
          
          // Update selected chat with messages from the database
          const updatedChat = {
            ...selectedChat,
            messages: formattedMessages,
          };
          
          if (formattedMessages.length > 0) {
            const lastMsg = formattedMessages[formattedMessages.length - 1];
            updatedChat.lastMessage = lastMsg.text;
            updatedChat.lastMessageTime = lastMsg.timestamp;
          }
          
          setSelectedChat(updatedChat);
          
          // Update chat in the list
          setChats(
            chats.map(chat => 
              chat.id === selectedChat.id ? updatedChat : chat
            )
          );
        }
      } catch (err) {
        console.error("Error fetching conversation:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [selectedChat?.id, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Focus textarea when chat is selected
  useEffect(() => {
    if (selectedChat && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChat || !message.trim() || !currentUser) return;
    
    try {
      // Save the message in the database
      const sentMessage = await sendMessage(selectedChat.participantId, message.trim());
      
      if (!sentMessage) {
        console.error("Failed to send message");
        return;
      }
      
      // Create the message object for our app
      const newMessage = {
        id: sentMessage.id,
        senderId: 'current',
        text: sentMessage.content,
        timestamp: new Date(sentMessage.created_at).getTime(),
      };
      
      // Update selected chat
      const updatedChat = {
        ...selectedChat,
        messages: [...selectedChat.messages, newMessage],
        lastMessage: message.trim(),
        lastMessageTime: new Date(sentMessage.created_at).getTime(),
      };
      
      setChats(
        chats.map(chat => 
          chat.id === selectedChat.id ? updatedChat : chat
        )
      );
      
      setSelectedChat(updatedChat);
      setMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const formatMessageTime = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  if (!selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center p-3 border-b bg-background">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={selectedChat.profilePic} alt={selectedChat.participantName} />
          <AvatarFallback>{selectedChat.participantName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{selectedChat.participantName}</h3>
        </div>
      </div>
      
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoading ? (
          <div className="flex justify-center py-4">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : selectedChat.messages.length === 0 ? (
          <div className="flex justify-center py-4">
            <p className="text-gray-500">No messages yet. Say hello!</p>
          </div>
        ) : (
          selectedChat.messages.map((msg) => {
            const isCurrentUser = msg.senderId === 'current';
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[75%] rounded-2xl p-3 
                  ${isCurrentUser 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'}
                `}>
                  <p className="break-words">{msg.text}</p>
                  <p className={`text-xs mt-1 text-right ${
                    isCurrentUser ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-3 bg-background border-t mt-auto">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] max-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (message.trim()) {
                  handleSendMessage(e);
                }
              }
            }}
            autoFocus
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || isLoading} 
            className="self-end"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
