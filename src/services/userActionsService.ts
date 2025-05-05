
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

/**
 * Block a user
 */
export async function blockUser(currentUserId: string, userIdToBlock: string): Promise<boolean> {
  try {
    console.log(`Blocking user ${userIdToBlock} for user ${currentUserId}`);
    
    // First, get the current user's profile to check if they have any blocked users already
    const { data: userProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, blockedUsers')
      .eq('id', currentUserId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching user profile:', fetchError);
      return false;
    }
    
    // Initialize or update the blockedUsers array
    const blockedUsers = userProfile.blockedUsers || [];
    
    // Check if user is already blocked
    if (blockedUsers.includes(userIdToBlock)) {
      console.log(`User ${userIdToBlock} is already blocked`);
      return true;
    }
    
    // Add the user to block to the blockedUsers array
    blockedUsers.push(userIdToBlock);
    
    // Update the user's profile with the new blockedUsers array
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ blockedUsers: blockedUsers })
      .eq('id', currentUserId);
      
    if (updateError) {
      console.error('Error updating blocked users:', updateError);
      return false;
    }
    
    console.log(`Successfully blocked user ${userIdToBlock}`);
    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    return false;
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(currentUserId: string, userIdToUnblock: string): Promise<boolean> {
  try {
    console.log(`Unblocking user ${userIdToUnblock} for user ${currentUserId}`);
    
    // First, get the current user's profile
    const { data: userProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, blockedUsers')
      .eq('id', currentUserId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching user profile:', fetchError);
      return false;
    }
    
    // Check if blockedUsers exists and contains the user to unblock
    const blockedUsers = userProfile.blockedUsers || [];
    
    if (!blockedUsers.includes(userIdToUnblock)) {
      console.log(`User ${userIdToUnblock} is not blocked`);
      return true;
    }
    
    // Filter out the user to unblock
    const updatedBlockedUsers = blockedUsers.filter(id => id !== userIdToUnblock);
    
    // Update the user's profile with the new blockedUsers array
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ blockedUsers: updatedBlockedUsers })
      .eq('id', currentUserId);
      
    if (updateError) {
      console.error('Error updating blocked users:', updateError);
      return false;
    }
    
    console.log(`Successfully unblocked user ${userIdToUnblock}`);
    return true;
  } catch (error) {
    console.error('Error unblocking user:', error);
    return false;
  }
}

/**
 * Report a user to admins
 */
export async function reportUser(reporterId: string, reportedUserId: string, reason: string): Promise<boolean> {
  try {
    console.log(`Reporting user ${reportedUserId} by user ${reporterId} for reason: ${reason}`);
    
    // Insert into messages table with a special format to indicate a report
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: reporterId,
        receiver_id: reportedUserId,
        content: JSON.stringify({
          type: 'user_report',
          reason: reason,
          timestamp: Date.now()
        }),
        read: false
      });
      
    if (error) {
      console.error('Error submitting user report:', error);
      return false;
    }
    
    console.log(`Successfully reported user ${reportedUserId}`);
    return true;
  } catch (error) {
    console.error('Error reporting user:', error);
    return false;
  }
}
