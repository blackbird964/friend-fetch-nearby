
import { supabase } from '@/integrations/supabase/client';
import { FriendRequest } from '@/context/types';

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
    // Create the friend request object
    const newRequest: FriendRequest = {
      id: `fr-${Date.now()}`,
      senderId,
      senderName,
      senderProfilePic,
      receiverId,
      receiverName,
      receiverProfilePic,
      duration,
      status: 'pending', // This is explicitly set to one of the allowed values
      timestamp: Date.now()
    };

    // Since we don't have a friend_requests table in the database yet,
    // we'll just use messages table as a temporary solution
    // and later we can create a proper friend_requests table
    const { data, error } = await supabase
      .from('messages')
      .insert({
        id: newRequest.id,
        sender_id: senderId,
        receiver_id: receiverId,
        content: JSON.stringify({
          type: 'friend_request',
          duration: duration,
          status: 'pending',
          timestamp: Date.now()
        }),
        read: false
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Error saving friend request to database:', error);
    } else {
      console.log('Friend request saved to database:', data);
    }

    // Return the request object to handle in the context
    return newRequest;
  } catch (error) {
    console.error('Error sending friend request:', error);
    return null;
  }
}

/**
 * Update the status of a friend request
 */
export async function updateFriendRequestStatus(
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<boolean> {
  try {
    // Since we're using messages table temporarily for friend requests
    // we need to update the message content instead
    const { error } = await supabase
      .from('messages')
      .update({
        content: JSON.stringify({
          type: 'friend_request',
          status: status,
          timestamp: Date.now()
        }),
        read: true
      })
      .eq('id', requestId);
      
    if (error) {
      console.error('Error updating friend request status in database:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating friend request status:', error);
    return false;
  }
}

/**
 * Cancel a friend request that was sent
 */
export async function cancelFriendRequest(
  requestId: string
): Promise<boolean> {
  try {
    // Delete the message representing the friend request
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', requestId);
      
    if (error) {
      console.error('Error canceling friend request in database:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error canceling friend request:', error);
    return false;
  }
}
