
import { supabase } from '@/integrations/supabase/client';

export interface UpcomingSession {
  id: string;
  user_id: string;
  friend_id: string;
  friend_name: string;
  friend_profile_pic?: string;
  activity: string;
  duration: number;
  scheduled_at: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

/**
 * Create an upcoming session when a meetup request is accepted
 */
export async function createUpcomingSession(
  friendId: string,
  friendName: string,
  friendProfilePic: string | null,
  activity: string,
  duration: number
): Promise<UpcomingSession | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return null;
  }

  try {
    const { data: session, error } = await supabase
      .from('upcoming_sessions')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        friend_name: friendName,
        friend_profile_pic: friendProfilePic,
        activity,
        duration,
        scheduled_at: new Date().toISOString(),
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating upcoming session:', error);
      return null;
    }

    return session as UpcomingSession;
  } catch (error) {
    console.error('Error creating upcoming session:', error);
    return null;
  }
}

/**
 * Get all upcoming sessions for the current user
 */
export async function getUpcomingSessions(): Promise<UpcomingSession[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return [];
  }

  try {
    const { data: sessions, error } = await supabase
      .from('upcoming_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming sessions:', error);
      return [];
    }

    return (sessions || []) as UpcomingSession[];
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    return [];
  }
}

/**
 * Mark a session as completed and update user's total catch-up time
 */
export async function completeSession(sessionId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return false;
  }

  try {
    // Get the session details first
    const { data: session, error: fetchError } = await supabase
      .from('upcoming_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !session) {
      console.error('Error fetching session:', fetchError);
      return false;
    }

    // Mark session as completed
    const { error: updateError } = await supabase
      .from('upcoming_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session status:', updateError);
      return false;
    }

    // Update user's total catch-up time in profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_catchup_time')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return false;
    }

    const currentTotal = profile?.total_catchup_time || 0;
    const newTotal = currentTotal + session.duration;

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ total_catchup_time: newTotal })
      .eq('id', user.id);

    if (updateProfileError) {
      console.error('Error updating total catch-up time:', updateProfileError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error completing session:', error);
    return false;
  }
}
