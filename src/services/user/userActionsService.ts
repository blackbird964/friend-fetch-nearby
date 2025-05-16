
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ProfileWithBlockedUsers } from '@/lib/supabase/profiles';

/**
 * Add a user to the current user's blocked list
 */
export async function blockUser(currentUserId: string, blockedUserId: string): Promise<boolean> {
  try {
    // First get the current profile with any existing blocked users
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return false;
    }
    
    // Cast to our profile type
    const profileWithBlocked = profile as ProfileWithBlockedUsers;
    
    // Get current blocked users or initialize empty array
    const currentBlockedUsers = profileWithBlocked.blocked_users || [];
    
    // Add new blocked user if not already blocked
    if (!currentBlockedUsers.includes(blockedUserId)) {
      // Add to the blocked_users array
      const updatedBlockedUsers = [...currentBlockedUsers, blockedUserId];
      
      // Update the profile with new blocked users array
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          blocked_users: updatedBlockedUsers
        })
        .eq('id', currentUserId);
        
      if (updateError) {
        console.error('Error updating blocked users:', updateError);
        return false;
      }
      
      return true;
    }
    
    // User was already blocked
    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    return false;
  }
}

/**
 * Remove a user from the current user's blocked list
 */
export async function unblockUser(currentUserId: string, blockedUserId: string): Promise<boolean> {
  try {
    // First get the current profile with any existing blocked users
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return false;
    }
    
    // Cast to our profile type
    const profileWithBlocked = profile as ProfileWithBlockedUsers;
    
    // Get current blocked users or initialize empty array
    const currentBlockedUsers = profileWithBlocked.blocked_users || [];
    
    // Remove the blocked user
    const updatedBlockedUsers = currentBlockedUsers.filter(id => id !== blockedUserId);
    
    // Update the profile with new blocked users array
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        blocked_users: updatedBlockedUsers
      })
      .eq('id', currentUserId);
      
    if (updateError) {
      console.error('Error updating blocked users:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error unblocking user:', error);
    return false;
  }
}

/**
 * Report a user to administrators
 */
export async function reportUser(reporterId: string, reportedUserId: string, reason: string): Promise<boolean> {
  try {
    const reportId = uuidv4();
    
    // Store report as a message for admin review
    const { error } = await supabase
      .from('messages')
      .insert({
        id: reportId,
        sender_id: reporterId,
        receiver_id: 'admin', // Special receiver ID for admin reports
        content: JSON.stringify({
          type: 'user_report',
          reported_user_id: reportedUserId,
          reason: reason,
          timestamp: Date.now()
        }),
        read: false
      });
      
    if (error) {
      console.error('Error reporting user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error reporting user:', error);
    return false;
  }
}
