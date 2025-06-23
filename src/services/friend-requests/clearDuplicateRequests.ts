
import { supabase } from '@/integrations/supabase/client';

/**
 * Clear duplicate friend requests from specific users
 */
export async function clearDuplicateRequests(
  currentUserId: string,
  targetUserNames: string[] = ['Harpreet Dhillon', 'User']
): Promise<boolean> {
  try {
    console.log('Clearing duplicate requests from:', targetUserNames);
    
    // Fetch messages that are friend requests from the target users
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('sender_id', currentUserId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching messages for cleanup:', error);
      return false;
    }
    
    // Filter for friend requests from target users
    const duplicateRequests = data.filter(message => {
      try {
        const content = JSON.parse(message.content);
        if (content.type !== 'friend_request') return false;
        
        // Check if the receiver name matches any of our target names
        return targetUserNames.some(name => 
          content.receiverName === name || 
          content.receiver_name === name
        );
      } catch {
        return false;
      }
    });
    
    console.log(`Found ${duplicateRequests.length} duplicate requests to clean up`);
    
    // Delete the duplicate requests
    if (duplicateRequests.length > 0) {
      const requestIds = duplicateRequests.map(req => req.id);
      
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .in('id', requestIds);
        
      if (deleteError) {
        console.error('Error deleting duplicate requests:', deleteError);
        return false;
      }
      
      console.log(`Successfully removed ${duplicateRequests.length} duplicate requests`);
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing duplicate requests:', error);
    return false;
  }
}
