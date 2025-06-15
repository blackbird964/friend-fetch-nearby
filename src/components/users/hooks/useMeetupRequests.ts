
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { MeetupRequest } from '@/context/types';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { sendMessage } from '@/lib/supabase/messages';
import { createUpcomingSession } from '@/services/upcoming-sessions';
import { sendMeetupAcceptanceEmail } from '@/services/notifications/meetupNotifications';

export const useMeetupRequests = () => {
  const { currentUser, meetupRequests, setMeetupRequests, chats, setChats } = useAppContext();
  const [loading, setLoading] = useState(false);

  // Helper function to update meetup request status
  const updateMeetupRequestStatus = async (
    requestId: string,
    status: 'accepted' | 'rejected'
  ): Promise<boolean> => {
    try {
      console.log(`Updating meetup request ${requestId} status to ${status}`);
      
      // Get the current message content first
      const { data: currentMessage, error: fetchError } = await supabase
        .from('messages')
        .select('content')
        .eq('id', requestId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching message:', fetchError);
        return false;
      }
      
      console.log("Current message content:", currentMessage);
      
      // Parse the current content
      let content;
      try {
        content = JSON.parse(currentMessage.content);
      } catch (e) {
        console.error('Error parsing message content:', e);
        return false;
      }
      
      // Update only the status field
      content.status = status;
      
      console.log("Updated content:", content);
      
      // Update the message with the new status
      const { error } = await supabase
        .from('messages')
        .update({
          content: JSON.stringify(content),
          read: true
        })
        .eq('id', requestId);
        
      if (error) {
        console.error('Error updating meetup request status in database:', error);
        return false;
      }
      
      console.log(`Meetup request ${requestId} updated successfully to ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating meetup request status:', error);
      return false;
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!currentUser) return;
    
    const request = meetupRequests.find(r => r.id === requestId);
    if (!request) return;

    setLoading(true);
    try {
      // Update request status on the backend
      const success = await updateMeetupRequestStatus(requestId, 'accepted');
      
      if (success) {
        // Create upcoming session
        await createUpcomingSession(
          request.senderId,
          request.senderName,
          request.senderProfilePic || null,
          request.meetLocation || 'Meetup',
          parseInt(request.duration)
        );

        // Get sender's email to send notification
        const { data: senderProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', request.senderId)
          .single();

        if (!profileError && senderProfile) {
          // Get sender's email from auth.users (we need to use a different approach since we can't query auth.users directly)
          // For now, we'll skip the email notification if we can't get the email
          // In a real implementation, you might store email in the profiles table
          console.log('Would send email notification to sender if email was available');
        }

        // Update request status in local state
        setMeetupRequests(
          meetupRequests.map(r => 
            r.id === requestId ? { ...r, status: 'accepted' } : r
          )
        );

        // Send an automated chat message to the requester
        await sendMessage(request.senderId, `Your meetup request for ${request.duration} minutes at ${request.meetLocation || 'a location'} has been accepted!`);

        toast.success("Request Accepted", {
          description: `You've accepted ${request.senderName}'s meetup request. It's now scheduled in your upcoming catch-ups.`,
        });
      } else {
        throw new Error("Failed to update request status");
      }
    } catch (error) {
      console.error('Error accepting meetup request:', error);
      toast.error("Error", {
        description: "Failed to accept request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    const request = meetupRequests.find(r => r.id === requestId);
    if (!request) return;

    setLoading(true);
    try {
      // Update request status on the backend
      const success = await updateMeetupRequestStatus(requestId, 'rejected');
      
      if (success) {
        // Update request status in local state
        setMeetupRequests(
          meetupRequests.map(r => 
            r.id === requestId ? { ...r, status: 'rejected' } : r
          )
        );

        toast.success("Request Rejected", {
          description: `You've declined ${request.senderName}'s meetup request.`,
        });
      } else {
        throw new Error("Failed to update request status");
      }
    } catch (error) {
      console.error('Error rejecting meetup request:', error);
      toast.error("Error", {
        description: "Failed to reject request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    handleAccept,
    handleReject,
    loading
  };
};
