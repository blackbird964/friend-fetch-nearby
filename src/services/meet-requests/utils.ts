
import { v4 as uuidv4 } from 'uuid';
import { MeetupRequestMessageContent } from './types';

// Generate a new UUID for meetup requests
export function generateRequestId(): string {
  return uuidv4();
}

// Create the content field for the message table
export function createMeetupRequestMessageContent(
  duration: number,
  senderName: string,
  senderProfilePic: string | null,
  receiverName: string,
  receiverProfilePic: string | null,
  meetLocation?: string,
  status: 'pending' | 'accepted' | 'rejected' = 'pending'
): string {
  const content: MeetupRequestMessageContent = {
    type: 'meetup_request',
    duration,
    sender_name: senderName,
    sender_profile_pic: senderProfilePic,
    receiver_name: receiverName,
    receiver_profile_pic: receiverProfilePic,
    status,
    timestamp: Date.now(),
    meet_location: meetLocation
  };

  return JSON.stringify(content);
}

// Convert a message to a meetup request object
export function messageToMeetupRequest(message: any): any | null {
  try {
    const content = JSON.parse(message.content);
    
    if (content.type !== 'meetup_request') {
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
      timestamp: content.timestamp,
      type: 'meetup',
      meetLocation: content.meet_location
    };
  } catch (error) {
    console.error('Error parsing message to meetup request:', error);
    return null;
  }
}
