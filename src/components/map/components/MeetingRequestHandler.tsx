
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import UserRequestCard from './UserRequestCard';

interface MeetingRequestHandlerProps {
  selectedUser: string | null;
  selectedDuration: number;
  setSelectedDuration: React.Dispatch<React.SetStateAction<number>>;
  onSendRequest: () => void;
  onCancel: () => void;
  nearbyUsers: any[];
}

const MeetingRequestHandler: React.FC<MeetingRequestHandlerProps> = ({
  selectedUser,
  selectedDuration,
  setSelectedDuration,
  onSendRequest,
  onCancel,
  nearbyUsers
}) => {
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  
  const handleSendRequest = () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to send friend requests",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedUser) return;
    
    onSendRequest();
  };

  // If no user is selected, don't render the request card
  if (!selectedUser) return null;

  // Find the selected user
  const user = nearbyUsers.find(u => u.id === selectedUser);
  if (!user) return null;
  
  return (
    <UserRequestCard 
      user={user}
      selectedDuration={selectedDuration}
      setSelectedDuration={setSelectedDuration}
      onSendRequest={handleSendRequest}
      onCancel={onCancel}
    />
  );
};

export default MeetingRequestHandler;
