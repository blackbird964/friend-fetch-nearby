
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';

const ChatWindow: React.FC = () => {
  const { selectedChat, setSelectedChat, chats, setChats, currentUser } = useAppContext();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Focus textarea when chat is selected
  useEffect(() => {
    if (selectedChat && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChat || !message.trim() || !currentUser) return;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'current',
      text: message.trim(),
      timestamp: Date.now(),
    };
    
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: message.trim(),
      lastMessageTime: Date.now(),
    };
    
    setChats(
      chats.map(chat => 
        chat.id === selectedChat.id ? updatedChat : chat
      )
    );
    
    setSelectedChat(updatedChat);
    setMessage('');
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
      <div className="flex items-center p-3 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2" 
          onClick={() => setSelectedChat(null)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={selectedChat.profilePic} alt={selectedChat.participantName} />
          <AvatarFallback>{selectedChat.participantName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{selectedChat.participantName}</h3>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {selectedChat.messages.map((msg) => {
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
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input - Fixed position at the bottom */}
      <div className="border-t bg-background p-3 sticky bottom-0">
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
            disabled={!message.trim()} 
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
