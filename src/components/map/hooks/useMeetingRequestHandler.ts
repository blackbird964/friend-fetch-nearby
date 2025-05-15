
import { useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AppUser } from '@/context/types';
import { sendMeetupRequest } from '@/services/meet-requests';
import { useAppContext } from '@/context/AppContext';
import { useSocialContext } from '@/context/SocialContext';

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
  const { currentUser } = useAppContext();
  const { refreshMeetupRequests } = useSocialContext();
  const { toast } = useToast();
  const requestSentToastRef = useRef<boolean>(false);
  
  // Handle sending a meeting request
  const handleSendRequest = async (selectedDuration: number) => {
    if (!selectedUser || !currentUser) return;
    
    const user = nearbyUsers.find(u => u.id === selectedUser);
    if (!user) return;
    
    try {
      console.log(`Sending a ${selectedDuration} minute meetup request to ${user.name}`);
      
      // Send the meetup request
      const request = await sendMeetupRequest(
        currentUser.id,
        currentUser.name || 'User',
        currentUser.profile_pic || null,
        user.id,
        user.name || 'User',
        user.profile_pic || null,
        selectedDuration,
        'Wynyard'
      );
      
      if (request) {
        // Refresh the meetup requests list to show the new request
        await refreshMeetupRequests();
        
        // In a real implementation, we would update the local state
        // For now, we'll just animate to simulate acceptance
        animateUserToMeeting(user, selectedDuration);
        
        // Only show toast once per session to prevent flickering
        if (!requestSentToastRef.current) {
          toast({
            title: "Request Sent!",
            description: `You've sent a ${selectedDuration} minute meet-up request to ${user.name}`,
          });
          requestSentToastRef.current = true;
        }
      } else {
        throw new Error("Failed to send meetup request");
      }
    } catch (error) {
      console.error("Error sending meetup request:", error);
      toast({
        title: "Error",
        description: "Failed to send meetup request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    requestSentToastRef,
    handleSendRequest
  };
};
