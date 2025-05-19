
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ProfileWithBlockedUsers } from '@/lib/supabase/profiles';
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
    
    // Get the data and ensure types are correct
    const profileData = profile as any;
    
    // Add in blockedUsers property for compatibility
    const blockedUsers = profileData.blocked_users || [];
    
    // Add new blocked user if not already blocked
    if (!blockedUsers.includes(blockedUserId)) {
      blockedUsers.push(blockedUserId);
      
      // Update the profile with new blocked users array
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          blocked_users: blockedUsers
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
    
    // Get the data and ensure types are correct
    const profileData = profile as any;
    
    // Get current blocked users or initialize empty array
    const blockedUsers = profileData.blocked_users || [];
    
    // Remove the blocked user
    const updatedBlockedUsers = blockedUsers.filter((id: string) => id !== blockedUserId);
    
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
 * Helper function to safely convert Json type to any array
 */
function convertJsonToActivePriorities(jsonData: Json | null): any[] {
  if (!jsonData) return [];
  
  // If it's already an array, map it to ensure it has the correct structure
  if (Array.isArray(jsonData)) {
    return jsonData.map(item => {
      // Handle each item safely with type checking
      const priority: any = {};
      
      if (item && typeof item === 'object') {
        // Only add properties that exist
        if ('id' in item) {
          priority.id = item.id;
        }
        
        if ('category' in item) {
          priority.category = item.category;
        }
        
        if ('activity' in item) {
          priority.activity = item.activity;
        }
        
        if ('frequency' in item) {
          priority.frequency = item.frequency;
        }
        
        if ('timePreference' in item) {
          priority.timePreference = item.timePreference;
        }
        
        if ('urgency' in item) {
          priority.urgency = item.urgency;
        }
        
        if ('location' in item) {
          priority.location = item.location;
        }
        
        if ('experienceLevel' in item) {
          priority.experienceLevel = item.experienceLevel;
        }
      }
      
      return priority;
    });
  }
  
  return [];
}
