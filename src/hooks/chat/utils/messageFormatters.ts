
import { Message, Chat } from '@/context/types';
import { normalizeTimestamp } from './timestampUtils';

export const formatDbMessageToAppMessage = (
  dbMsg: any, 
  selectedChat: Chat, 
  currentUserId: string
): Message => ({
  id: dbMsg.id,
  chatId: selectedChat.id,
  senderId: dbMsg.sender_id === currentUserId ? 'current' : selectedChat.participantId,
  receiverId: dbMsg.receiver_id,
  text: dbMsg.content,
  content: dbMsg.content,
  timestamp: new Date(dbMsg.created_at).getTime(),
  isRead: dbMsg.read || false,
  status: dbMsg.sender_id === currentUserId ? 'sent' : 'received',
});

export const createOptimisticMessage = (
  originalMessage: string,
  selectedChat: Chat,
  tempId: string,
  currentTimestamp: number
): Message => ({
  id: tempId,
  chatId: selectedChat.id,
  senderId: 'current',
  receiverId: selectedChat.participantId,
  text: originalMessage,
  content: originalMessage,
  timestamp: currentTimestamp,
  isRead: false,
  status: 'sending',
});

export const createRealTimeMessage = (
  newDbMessage: any,
  selectedChat: Chat
): Message => ({
  id: newDbMessage.id,
  chatId: selectedChat.id,
  senderId: selectedChat.participantId,
  receiverId: newDbMessage.receiver_id,
  text: newDbMessage.content,
  content: newDbMessage.content,
  timestamp: new Date(newDbMessage.created_at).getTime(),
  isRead: newDbMessage.read || false,
  status: 'received',
});
