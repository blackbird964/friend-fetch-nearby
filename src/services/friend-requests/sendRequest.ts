
import { supabase } from '@/integrations/supabase/client';
import { FriendRequest } from '@/context/types';
import { generateRequestId, createFriendRequestMessageContent } from './utils';

/**
 * Send a friend request from one user to another
 */
export async function sendFriendRequest(
  senderId: string,
  senderName: string,
  senderProfilePic: string | null,
  receiverId: string,
  receiverName: string,
  receiverProfilePic: string | null,
  duration: number
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
      duration,
      sender_name: senderName // For backwards compatibility
    };

    console.log("Sending friend request:", newRequest);

    // Create message content
    const content = createFriendRequestMessageContent(
      duration,
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

    return newRequest;
  } catch (error) {
    console.error('Error sending friend request:', error);
    return null;
  }
}
