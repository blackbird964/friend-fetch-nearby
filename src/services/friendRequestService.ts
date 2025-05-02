
import { supabase } from '@/integrations/supabase/client';
import { FriendRequest } from '@/context/types';

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
    const newRequest: FriendRequest = {
      id: `fr-${Date.now()}`,
      senderId,
      senderName,
      senderProfilePic,
      receiverId,
      receiverName,
      receiverProfilePic,
      duration,
      status: 'pending', // Explicitly set to one of the allowed values
      timestamp: Date.now()
    };

    // In production, you would save this to the database
    // Insert into Supabase
    const { data, error } = await supabase
      .from('friend_requests')
      .insert({
        id: newRequest.id,
        sender_id: senderId,
        receiver_id: receiverId,
        duration: duration,
        status: 'pending',
        timestamp: Date.now()
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

export async function updateFriendRequestStatus(
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<boolean> {
  try {
    // Update in Supabase
    const { error } = await supabase
      .from('friend_requests')
      .update({ status })
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
