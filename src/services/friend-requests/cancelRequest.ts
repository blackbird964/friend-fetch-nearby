
import { supabase } from '@/integrations/supabase/client';

/**
 * Cancel a friend request that was sent
 */
export async function cancelFriendRequest(
  requestId: string
): Promise<boolean> {
  try {
    console.log(`Cancelling friend request ${requestId}`);
    
    // First, verify the message exists and is actually a friend request
    const { data: messageToDelete, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', requestId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching message to cancel:', fetchError);
      return false;
    }
    
    if (!messageToDelete) {
      console.error('Message not found for cancellation:', requestId);
      return false;
    }
    
    // Verify it's actually a friend request
    try {
      const content = JSON.parse(messageToDelete.content);
      if (content.type !== 'friend_request') {
        console.error('Message is not a friend request:', requestId);
        return false;
      }
    } catch {
      console.error('Invalid message content format:', requestId);
      return false;
    }
    
    // Delete the message representing the friend request
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', requestId);
      
    if (deleteError) {
      console.error('Error canceling friend request in database:', deleteError);
      return false;
    }
    
    // Double-check that the deletion was successful
    const { data: verifyDeleted, error: verifyError } = await supabase
      .from('messages')
      .select('id')
      .eq('id', requestId)
      .maybeSingle();
      
    if (verifyError) {
      console.error('Error verifying deletion:', verifyError);
      return false;
    }
    
    if (verifyDeleted) {
      console.error('Friend request was not actually deleted:', requestId);
      return false;
    }
    
    console.log(`Friend request ${requestId} cancelled and verified deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error canceling friend request:', error);
    return false;
  }
}
