
import { Message as ContextMessage, Chat } from '@/context/types';

export const formatMessage = (msg: any): ContextMessage => {
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

export const formatMessageContent = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    
    // Handle friend request messages
    if (parsed.type === 'friend_request') {
      switch (parsed.status) {
        case 'pending':
          return 'You have a new friend request';
        case 'accepted':
          return 'Friend request accepted';
        case 'rejected':
          return 'Friend request declined';
        default:
          return 'Friend request';
      }
    }
    
    // Handle meetup request messages
    if (parsed.type === 'meetup_request') {
      switch (parsed.status) {
        case 'pending':
          return 'You have a new meetup request';
        case 'accepted':
          return 'Meetup request accepted';
        case 'rejected':
          return 'Meetup request declined';
        default:
          return 'Meetup request';
      }
    }
    
    // If it's JSON but not a recognized type, return the original content
    return content;
  } catch {
    // If it's not JSON, return the original content
    return content;
  }
};

export const formatMessages = (messages: any[]): ContextMessage[] => {
  return messages
    .filter(msg => shouldDisplayMessage(msg.content))
    .map(msg => {
      const formattedMsg = formatMessage(msg);
      // Format the content for display
      formattedMsg.content = formatMessageContent(msg.content);
      return formattedMsg;
    })
    .sort((a, b) => a.timestamp - b.timestamp);
};

export const createOptimisticMessage = (
  content: string,
  chat: Chat,
  tempId: string,
  timestamp: number
): ContextMessage => {
  return {
    id: tempId,
    chatId: chat.id,
    senderId: 'current',
    content,
    text: content,
    timestamp,
    status: 'sending'
  };
};

export const createRealTimeMessage = (dbMessage: any, chat: Chat): ContextMessage => {
  return {
    id: dbMessage.id,
    chatId: chat.id,
    senderId: dbMessage.sender_id,
    content: formatMessageContent(dbMessage.content),
    text: formatMessageContent(dbMessage.content),
    timestamp: new Date(dbMessage.created_at).getTime(),
    status: 'received'
  };
};
