
import { FriendRequest } from '@/context/types';
import { FriendRequestMessageContent } from './types';
import { v4 as uuidv4 } from 'uuid';

// Generate a new UUID for friend requests
export function generateRequestId(): string {
  return uuidv4();
}

// Convert a message to a friend request object
export function messageToFriendRequest(message: any): FriendRequest | null {
  try {
    const content = JSON.parse(message.content) as FriendRequestMessageContent;
    
    if (content.type !== 'friend_request') {
      return null;
    }

    return {
      id: message.id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      senderName: content.sender_name,
      senderProfilePic: content.sender_profile_pic,
      receiverName: content.receiver_name,
      receiverProfilePic: content.receiver_profile_pic,
      duration: content.duration,
      status: content.status,
      timestamp: content.timestamp
    };
  } catch (error) {
    console.error('Error parsing message to friend request:', error);
    return null;
  }
}

// Create the content field for the message table
export function createRequestMessageContent(
  duration: number,
  senderName: string,
  senderProfilePic: string | null,
  receiverName: string,
  receiverProfilePic: string | null,
  status: 'pending' | 'accepted' | 'rejected' = 'pending'
): string {
  const content: FriendRequestMessageContent = {
    type: 'friend_request',
    duration,
    sender_name: senderName,
    sender_profile_pic: senderProfilePic,
    receiver_name: receiverName,
    receiver_profile_pic: receiverProfilePic,
    status,
    timestamp: Date.now()
  };

  return JSON.stringify(content);
}
