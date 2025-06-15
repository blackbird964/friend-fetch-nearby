
import { v4 as uuidv4 } from 'uuid';

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
