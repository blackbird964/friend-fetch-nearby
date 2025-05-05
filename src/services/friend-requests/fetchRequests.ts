
import { supabase } from '@/integrations/supabase/client';
import { FriendRequest } from '@/context/types';
import { messageToFriendRequest } from './utils';

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
        const request = messageToFriendRequest(message);
        return request as FriendRequest; // We already filtered out non-friend requests
      })
      .filter(Boolean); // Remove any null values
      
    console.log("Processed friend requests:", friendRequests);
    return friendRequests;
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return [];
  }
}
