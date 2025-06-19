
import { supabase } from '@/integrations/supabase/client';

/**
 * Clear old/duplicate friend requests for a user
 */
export async function clearOldFriendRequests(userId: string): Promise<boolean> {
  try {
    console.log(`Clearing old friend requests for user ${userId}`);
    
    // Delete old friend request messages where user is sender or receiver
    const { error } = await supabase
      .from('messages')
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .like('content', '%"type":"friend_request"%');
      
    if (error) {
      console.error('Error clearing old friend requests:', error);
      return false;
    }
    
    console.log('Old friend requests cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing old friend requests:', error);
    return false;
  }
}
