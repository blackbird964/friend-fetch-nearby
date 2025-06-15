
import { v4 as uuidv4 } from 'uuid';
import { FriendRequest } from './types';

export const generateRequestId = (): string => {
  return uuidv4();
};

export const createFriendRequestMessageContent = (
  duration: number,
  senderName: string,
  senderProfilePic: string | null,
  receiverName: string,
  receiverProfilePic: string | null
): string => {
  const messageData = {
    type: 'friend_request',
    status: 'pending',
    duration,
    sender_name: senderName,
    senderName,
    senderProfilePic,
    receiverName,
    receiverProfilePic,
    timestamp: Date.now()
  };
  
  return JSON.stringify(messageData);
};

export const parseFriendRequestContent = (content: string) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing friend request content:', error);
    return null;
  }
};

export const messageToFriendRequest = (message: any): FriendRequest | null => {
  try {
    const parsed = JSON.parse(message.content);
    if (parsed.type === 'friend_request') {
      return {
        id: message.id,
        senderId: message.sender_id,
        senderName: parsed.senderName || parsed.sender_name,
        senderProfilePic: parsed.senderProfilePic,
        receiverId: message.receiver_id,
        receiverName: parsed.receiverName,
        receiverProfilePic: parsed.receiverProfilePic,
        timestamp: parsed.timestamp || new Date(message.created_at).getTime(),
        status: parsed.status || 'pending',
        duration: parsed.duration || 30,
        sender_name: parsed.sender_name
      };
    }
    return null;
  } catch (error) {
    console.error('Error converting message to friend request:', error);
    return null;
  }
};
