
import { supabase } from '@/integrations/supabase/client';
import { FriendRequest } from '@/context/types';
import { v4 as uuidv4 } from 'uuid';

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
    // Create a proper UUID for the request instead of a custom string format
    const requestId = uuidv4();
    
    // Create the friend request object
    const newRequest: FriendRequest = {
      id: requestId,
      senderId,
      senderName,
      senderProfilePic,
      receiverId,
      receiverName,
      receiverProfilePic,
      duration,
      status: 'pending',
      timestamp: Date.now()
    };

    console.log("Sending friend request:", newRequest);

    // Since we don't have a friend_requests table in the database yet,
    // we'll use messages table as a temporary solution
    const { data, error } = await supabase
      .from('messages')
      .insert({
        id: requestId, // Using a proper UUID now
        sender_id: senderId,
        receiver_id: receiverId,
        content: JSON.stringify({
          type: 'friend_request',
          duration: duration,
          sender_name: senderName,
          sender_profile_pic: senderProfilePic,
          receiver_name: receiverName,
          receiver_profile_pic: receiverProfilePic,
          status: 'pending',
          timestamp: Date.now()
        }),
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

    // Return the request object to handle in the context
    return newRequest;
  } catch (error) {
    console.error('Error sending friend request:', error);
    return null;
  }
}

/**
 * Fetch friend requests for a user
 */
export async function fetchFriendRequests(userId: string): Promise<FriendRequest[]> {
  try {
    console.log("Fetching friend requests for user ID:", userId);
    
    // Fetch messages that are actually friend requests where the user is sender or receiver
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching friend requests:', error);
      return [];
    }
    
    console.log("Raw messages data:", data);
    
    // Filter out messages that aren't friend requests
    const friendRequests = data
      .filter(message => {
        try {
          const content = JSON.parse(message.content);
          return content.type === 'friend_request';
        } catch {
          return false;
        }
      })
      .map(message => {
        const content = JSON.parse(message.content);
        
        return {
          id: message.id,
          senderId: message.sender_id,
          receiverId: message.receiver_id,
          senderName: content.sender_name,
          senderProfilePic: content.sender_profile_pic,
          receiverName: content.receiver_name,
          receiverProfilePic: content.receiver_profile_pic,
          duration: content.duration,
          status: content.status,
          timestamp: content.timestamp
        };
      });
      
    console.log("Processed friend requests:", friendRequests);
    return friendRequests;
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return [];
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
    console.log(`Updating friend request ${requestId} status to ${status}`);
    
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
      console.error('Error updating friend request status in database:', error);
      return false;
    }
    
    console.log(`Friend request ${requestId} updated successfully to ${status}`);
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
    console.log(`Cancelling friend request ${requestId}`);
    
    // Delete the message representing the friend request
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', requestId);
      
    if (error) {
      console.error('Error canceling friend request in database:', error);
      return false;
    }
    
    console.log(`Friend request ${requestId} cancelled successfully`);
    return true;
  } catch (error) {
    console.error('Error canceling friend request:', error);
    return false;
  }
}
