
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  participantName: string;
  profilePic: string;
  onBack?: () => void;
  showBackButton: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  participantName, 
  profilePic, 
  onBack, 
  showBackButton 
}) => {
  return (
    <div className="flex items-center p-3 border-b bg-background sticky top-0 z-10 shadow-sm">
      {showBackButton && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={profilePic} alt={participantName} />
        <AvatarFallback>{participantName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-medium">{participantName}</h3>
      </div>
    </div>
  );
};

export default ChatHeader;
