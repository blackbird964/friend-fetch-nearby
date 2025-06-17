
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { MeetupRequest } from '@/context/types';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { sendMessage } from '@/lib/supabase/messages';
import { createUpcomingSession } from '@/services/upcoming-sessions';

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
          request.duration
        );

        // Send email notification to the original sender
        try {
          // Fetch the original sender's email from profiles table
          const { data: senderProfile, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', request.senderId)
            .single();

          if (profileError) {
            console.error('Error fetching sender profile:', profileError);
          } else if (senderProfile?.email) {
            console.log('Sending meetup acceptance email notification to:', senderProfile.email);

            const { data, error: emailError } = await supabase.functions.invoke('send-meetup-notification', {
              body: {
                email: senderProfile.email,
                senderName: currentUser.name || 'Someone',
                duration: request.duration,
                activity: request.meetLocation || 'a location',
                loginUrl: `${window.location.origin}/auth`
              }
            });

            if (emailError) {
              console.error('Error sending acceptance email:', emailError);
            } else {
              console.log('Acceptance email sent successfully:', data);
            }
          } else {
            console.log('No email found for sender:', request.senderId);
          }
        } catch (emailError) {
          console.error('Failed to send acceptance email:', emailError);
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
