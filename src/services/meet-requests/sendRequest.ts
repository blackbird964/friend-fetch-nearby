
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

    // Send email notification to the receiver
    try {
      // Fetch receiver's email from profiles table
      const { data: receiverProfile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', receiverId)
        .single();

      if (profileError) {
        console.error('Error fetching receiver profile:', profileError);
        return newRequest;
      }

      if (receiverProfile?.email) {
        console.log('Sending meetup request email notification to:', receiverProfile.email);
        
        await sendMeetupRequestEmail(
          receiverProfile.email,
          senderName,
          duration,
          meetLocation || 'a location'
        );
      } else {
        console.log('No email found for receiver:', receiverId);
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
