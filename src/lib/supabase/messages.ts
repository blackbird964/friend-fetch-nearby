
import { supabase } from '@/integrations/supabase/client';

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

/**
 * Send a message to another user and save it to the database
 */
export async function sendMessage(receiverId: string, content: string): Promise<Message | null> {
  console.log("Sending message to:", receiverId, content);
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return null;
  }
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      receiver_id: receiverId,
      sender_id: user.id,
      content
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error sending message:', error);
    return null;
  }
  
  return data as Message;
}

/**
 * Get all messages between the current user and another user
 */
export async function getConversation(otherUserId: string): Promise<Message[]> {
  console.log("Getting conversation with:", otherUserId);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return [];
  }
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching conversation:', error);
    return [];
  }
  
  return data as Message[];
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(messageIds: string[]): Promise<void> {
  if (!messageIds.length) return;
  
  console.log("Marking messages as read:", messageIds);
  
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .in('id', messageIds);
  
  if (error) {
    console.error('Error marking messages as read:', error);
  }
}
