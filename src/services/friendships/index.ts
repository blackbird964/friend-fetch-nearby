
import { supabase } from '@/integrations/supabase/client';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'blocked' | 'removed';
}

/**
 * Create a friendship record when users become friends
 */
export async function createFriendship(friendId: string): Promise<Friendship | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return null;
  }

  try {
    // Create friendship record
    const { data: friendship, error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating friendship:', error);
      return null;
    }

    // Also create the reverse friendship for easier queries
    await supabase
      .from('friendships')
      .insert({
        user_id: friendId,
        friend_id: user.id,
        status: 'active'
      });

    return friendship;
  } catch (error) {
    console.error('Error creating friendship:', error);
    return null;
  }
}

/**
 * Get friendship information between current user and another user
 */
export async function getFriendship(friendId: string): Promise<Friendship | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return null;
  }

  try {
    const { data: friendship, error } = await supabase
      .from('friendships')
      .select('*')
      .eq('user_id', user.id)
      .eq('friend_id', friendId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error fetching friendship:', error);
      return null;
    }

    return friendship;
  } catch (error) {
    console.error('Error fetching friendship:', error);
    return null;
  }
}

/**
 * Get all friendships for the current user
 */
export async function getUserFriendships(): Promise<Friendship[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return [];
  }

  try {
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching friendships:', error);
      return [];
    }

    return friendships || [];
  } catch (error) {
    console.error('Error fetching friendships:', error);
    return [];
  }
}

/**
 * Remove a friendship
 */
export async function removeFriendship(friendId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return false;
  }

  try {
    // Update both friendship records to 'removed' status
    const { error: error1 } = await supabase
      .from('friendships')
      .update({ status: 'removed' })
      .eq('user_id', user.id)
      .eq('friend_id', friendId);

    const { error: error2 } = await supabase
      .from('friendships')
      .update({ status: 'removed' })
      .eq('user_id', friendId)
      .eq('friend_id', user.id);

    if (error1 || error2) {
      console.error('Error removing friendship:', error1 || error2);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing friendship:', error);
    return false;
  }
}
