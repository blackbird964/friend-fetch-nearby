
import { Message as SupabaseMessage } from '@/integrations/supabase/types';
import { Message } from '@/context/types';

export const formatMessage = (msg: SupabaseMessage): Message => {
  return {
    id: msg.id,
    chatId: `chat-${msg.sender_id}-${msg.receiver_id}`,
    senderId: msg.sender_id,
    content: msg.content,
    timestamp: new Date(msg.created_at).getTime(),
    status: msg.read ? 'read' : 'delivered'
  };
};

export const shouldDisplayMessage = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content);
    // Don't display meetup requests in chat - they should appear in check-ins
    return parsed.type !== 'meetup_request';
  } catch {
    // If it's not JSON, it's a regular message
    return true;
  }
};

export const formatMessages = (messages: SupabaseMessage[]): Message[] => {
  return messages
    .filter(msg => shouldDisplayMessage(msg.content))
    .map(formatMessage)
    .sort((a, b) => a.timestamp - b.timestamp);
};
