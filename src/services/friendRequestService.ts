
import { supabase } from '@/integrations/supabase/client';
import { FriendRequest } from '@/context/types';
import { useToast } from '@/hooks/use-toast';

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
    // For now, we'll return the object directly and handle it in the context
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
    // In production, you would update this in the database
    // For now, we'll just return true to indicate success
    return true;
  } catch (error) {
    console.error('Error updating friend request status:', error);
    return false;
  }
}
