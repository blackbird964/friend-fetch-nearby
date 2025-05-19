
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ProfileWithBlockedUsers, ActivePriority } from '@/lib/supabase/profiles';
import { Json } from '@/integrations/supabase/types';

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
    
    // Cast and normalize the profile type
    const profileWithBlocked: ProfileWithBlockedUsers = {
      ...profile,
      // Convert Json active_priorities to ActivePriority[] if it exists
      active_priorities: convertJsonToActivePriorities(profile.active_priorities),
      // Add in blockedUsers property for compatibility
      blockedUsers: profile.blocked_users || []
    };
    
    // Get current blocked users array or initialize empty array
    // Process with backward compatibility for both property names
    const currentBlockedUsers = profileWithBlocked.blocked_users || [];
    
    // Add new blocked user if not already blocked
    if (!currentBlockedUsers.includes(blockedUserId)) {
      currentBlockedUsers.push(blockedUserId);
      
      // Update the profile with new blocked users array
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          blocked_users: currentBlockedUsers
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
    
    // Cast and normalize the profile type
    const profileWithBlocked: ProfileWithBlockedUsers = {
      ...profile,
      // Convert Json active_priorities to ActivePriority[] if it exists
      active_priorities: convertJsonToActivePriorities(profile.active_priorities),
      // Add in blockedUsers property for compatibility
      blockedUsers: profile.blocked_users || []
    };
    
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
          status: 'pending',
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

/**
 * Helper function to convert Json type to ActivePriority[]
 */
function convertJsonToActivePriorities(jsonData: Json | null): ActivePriority[] {
  if (!jsonData) return [];
  
  // If it's already an array, map it to ensure it has the correct structure
  if (Array.isArray(jsonData)) {
    return jsonData.map(item => ({
      id: typeof item.id === 'string' ? item.id : '',
      category: typeof item.category === 'string' ? item.category : '',
      activity: typeof item.activity === 'string' ? item.activity : '',
      frequency: item.frequency as any,
      timePreference: item.timePreference as any,
      urgency: item.urgency as any,
      location: typeof item.location === 'string' ? item.location : undefined,
      experienceLevel: item.experienceLevel as any
    }));
  }
  
  return [];
}
