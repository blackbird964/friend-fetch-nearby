
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppUser } from '@/context/types';

type MeetingRequestHandlerProps = {
  selectedUser: string | null;
  nearbyUsers: AppUser[];
  animateUserToMeeting: (user: AppUser, duration: number) => void;
};

export const useMeetingRequestHandler = ({
  selectedUser,
  nearbyUsers,
  animateUserToMeeting
}: MeetingRequestHandlerProps) => {
  const { toast } = useToast();
  const requestSentToastRef = useRef<boolean>(false);
  
  // Handle sending a meeting request
  const handleSendRequest = async (selectedDuration: number) => {
    if (!selectedUser) return;
    
    const user = nearbyUsers.find(u => u.id === selectedUser);
    if (!user) return;
    
    // In a real implementation, we would save this to the database
    // For now, we'll just update the local state and animate
    animateUserToMeeting(user, selectedDuration);
    
    // Only show toast once per session to prevent flickering
    if (!requestSentToastRef.current) {
      toast({
        title: "Request Sent!",
        description: `You've sent a ${selectedDuration} minute meet-up request to ${user.name}`,
      });
      requestSentToastRef.current = true;
    }
  };

  return {
    requestSentToastRef,
    handleSendRequest
  };
};
