
import { supabase } from '@/integrations/supabase/client';

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
    // Ensure the content is properly serialized as a string
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
