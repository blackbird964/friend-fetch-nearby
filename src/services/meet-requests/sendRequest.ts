
import { supabase } from '@/integrations/supabase/client';
import { MeetupRequest } from './types';
import { generateRequestId, createMeetupRequestMessageContent } from './utils';
import { sendMeetupRequestEmail } from '@/services/notifications/meetupNotifications';

/**
 * Send a meetup request from one user to another
 */
export async function sendMeetupRequest(
  senderId: string,
  senderName: string,
  senderProfilePic: string | null,
  receiverId: string,
  receiverName: string,
  receiverProfilePic: string | null,
  duration: number,
  meetLocation?: string
): Promise<MeetupRequest | null> {
  try {
    // Create a proper UUID for the request
    const requestId = generateRequestId();
    
    // Create the meetup request object
    const newRequest: MeetupRequest = {
      id: requestId,
      senderId,
      senderName,
      senderProfilePic,
      receiverId,
      receiverName,
      receiverProfilePic,
      duration,
      status: 'pending',
      timestamp: Date.now(),
      type: 'meetup',
      meetLocation
    };

    console.log("Sending meetup request:", newRequest);

    // Create message content
    const content = createMeetupRequestMessageContent(
      duration,
      senderName,
      senderProfilePic,
      receiverName,
      receiverProfilePic,
      meetLocation
    );

    // Use messages table to store the request
    const { data, error } = await supabase
      .from('messages')
      .insert({
        id: requestId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Error saving meetup request to database:', error);
      return null;
    } else {
      console.log('Meetup request saved to database:', data);
    }

    // Check if receiver has email notifications enabled before sending email
    // Since the column might not exist yet, we'll handle the error gracefully
    try {
      const { data: receiverProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', receiverId)
        .single();

      // For now, assume email notifications are enabled if we can't check
      const emailNotificationsEnabled = true;

      if (emailNotificationsEnabled) {
        // Get receiver's email from auth.users to send notification
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(receiverId);

        if (!userError && user?.email) {
          console.log('Sending email notification to:', user.email);
          
          await sendMeetupRequestEmail(
            user.email,
            senderName,
            duration,
            meetLocation || 'a location'
          );
        } else {
          console.error('Could not fetch user email for notification:', userError);
        }
      } else {
        console.log('Email notifications disabled for user:', receiverId);
      }
    } catch (emailError) {
      console.log('Email notification check failed, but continuing:', emailError);
    }

    return newRequest;
  } catch (error) {
    console.error('Error sending meetup request:', error);
    return null;
  }
}
