
import { supabase } from '@/integrations/supabase/client';

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
