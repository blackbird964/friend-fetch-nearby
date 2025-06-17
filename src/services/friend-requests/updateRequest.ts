
import { supabase } from '@/integrations/supabase/client';
import { sendFriendRequestAcceptanceEmail } from '@/services/notifications/friendRequestNotifications';

/**
 * Update a friend request status (accept or reject)
 */
export async function updateFriendRequestStatus(
  requestId: string,
  status: 'accepted' | 'rejected',
  currentUserId: string,
  currentUserName: string
): Promise<boolean> {
  try {
    console.log(`Updating friend request ${requestId} status to ${status}`);
    
    // Get the current message content first
    const { data: currentMessage, error: fetchError } = await supabase
      .from('messages')
      .select('content, sender_id')
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

    // If the request was accepted, send acceptance email to the original sender
    if (status === 'accepted') {
      try {
        // Using your actual email for testing
        const testEmail = 'aaron.stathi@gmail.com';
        console.log('Sending friend request acceptance email notification to:', testEmail);
        
        await sendFriendRequestAcceptanceEmail(
          testEmail,
          currentUserName
        );
      } catch (emailError) {
        console.log('Friend request acceptance email notification failed, but continuing:', emailError);
      }
    }
    
    console.log(`Friend request ${requestId} updated successfully to ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating friend request status:', error);
    return false;
  }
}
