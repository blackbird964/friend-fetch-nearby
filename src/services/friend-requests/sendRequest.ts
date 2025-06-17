
import { supabase } from '@/integrations/supabase/client';
import { FriendRequest } from './types';
import { generateRequestId, createFriendRequestMessageContent } from './utils';
import { sendFriendRequestEmail } from '@/services/notifications/friendRequestNotifications';

/**
 * Send a friend request from one user to another
 */
export async function sendFriendRequest(
  senderId: string,
  senderName: string,
  senderProfilePic: string | null,
  receiverId: string,
  receiverName: string,
  receiverProfilePic: string | null
): Promise<FriendRequest | null> {
  try {
    // Create a proper UUID for the request
    const requestId = generateRequestId();
    
    // Create the friend request object
    const newRequest: FriendRequest = {
      id: requestId,
      senderId,
      senderName,
      senderProfilePic,
      receiverId,
      receiverName,
      receiverProfilePic,
      timestamp: Date.now(),
      status: 'pending',
      duration: 30 // Default duration for friend requests
    };

    console.log("Sending friend request:", newRequest);

    // Create message content - fix the function call to match the expected 5 arguments
    const content = createFriendRequestMessageContent(
      30, // duration
      senderName,
      senderProfilePic,
      receiverName,
      receiverProfilePic
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
      console.error('Error saving friend request to database:', error);
      return null;
    } else {
      console.log('Friend request saved to database:', data);
    }

    // Send email notification to the receiver using their actual email
    try {
      const testEmail = 'aaron.stathi@gmail.com'; // Using your actual email for testing
      console.log('Sending friend request email notification to:', testEmail);
      
      await sendFriendRequestEmail(
        testEmail,
        senderName,
        senderProfilePic
      );
    } catch (emailError) {
      console.log('Friend request email notification failed, but continuing:', emailError);
    }

    return newRequest;
  } catch (error) {
    console.error('Error sending friend request:', error);
    return null;
  }
}
