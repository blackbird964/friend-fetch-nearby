
export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderProfilePic?: string | null;
  receiverId: string;
  receiverName: string;
  receiverProfilePic?: string | null;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
  duration: number;
  sender_name?: string; // For backwards compatibility
}
