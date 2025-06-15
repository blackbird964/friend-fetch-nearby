
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Add a friend directly to user's friends list (for testing/admin purposes)
 */
export async function addDirectFriend(currentUserId: string, friendId: string): Promise<boolean> {
  try {
    // Create friendship record for current user -> friend
    const { error: error1 } = await supabase
      .from('friendships')
      .insert({
        user_id: currentUserId,
        friend_id: friendId,
        status: 'active'
      });

    if (error1) {
      console.error('Error creating friendship 1:', error1);
      return false;
    }

    // Create reverse friendship record for friend -> current user
    const { error: error2 } = await supabase
      .from('friendships')
      .insert({
        user_id: friendId,
        friend_id: currentUserId,
        status: 'active'
      });

    if (error2) {
      console.error('Error creating friendship 2:', error2);
      return false;
    }

    console.log('Direct friendship created successfully');
    return true;
  } catch (error) {
    console.error('Error adding direct friend:', error);
    return false;
  }
}

/**
 * Find user by name and add as friend directly
 */
export async function addFriendByName(currentUserId: string, friendName: string): Promise<boolean> {
  try {
    // First, find the user by name
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name')
      .ilike('name', `%${friendName}%`)
      .limit(5);

    if (error) {
      console.error('Error finding user:', error);
      toast.error('Error finding user');
      return false;
    }

    if (!profiles || profiles.length === 0) {
      toast.error(`User "${friendName}" not found`);
      return false;
    }

    // Find exact match or closest match
    const exactMatch = profiles.find(p => p.name?.toLowerCase() === friendName.toLowerCase());
    const targetUser = exactMatch || profiles[0];

    if (!targetUser) {
      toast.error(`User "${friendName}" not found`);
      return false;
    }

    // Add as friend
    const success = await addDirectFriend(currentUserId, targetUser.id);
    
    if (success) {
      toast.success(`Added ${targetUser.name} as a friend!`);
      return true;
    } else {
      toast.error(`Failed to add ${targetUser.name} as friend`);
      return false;
    }
  } catch (error) {
    console.error('Error adding friend by name:', error);
    toast.error('Error adding friend');
    return false;
  }
}
