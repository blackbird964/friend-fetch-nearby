
import { Chat, FriendRequest } from './types';

/**
 * Load mock friend requests for testing purposes
 */
export const loadMockFriendRequests = (): FriendRequest[] => {
  return [
    {
      id: 'fr1',
      senderId: '1',
      senderName: 'Sarah J.',
      senderProfilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      duration: 30,
      status: 'pending',
      timestamp: Date.now() - 1000 * 60 * 5,
    },
    {
      id: 'fr2',
      senderId: '5',
      senderName: 'Jessica M.',
      senderProfilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
      duration: 45,
      status: 'pending',
      timestamp: Date.now() - 1000 * 60 * 15,
    },
  ];
};

/**
 * Load mock chats with conversations for testing purposes
 */
export const loadMockChats = (): Chat[] => {
  return [
    {
      id: 'c1',
      participantId: '2',
      participantName: 'David L.',
      profilePic: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      lastMessage: 'Are you coming?',
      lastMessageTime: Date.now() - 1000 * 60 * 10,
      messages: [
        {
          id: 'm1',
          senderId: '2',
          text: 'Hi there! I noticed we share an interest in gaming.',
          timestamp: Date.now() - 1000 * 60 * 30,
        },
        {
          id: 'm2',
          senderId: 'current',
          text: 'Hello! Yes, I love indie games especially.',
          timestamp: Date.now() - 1000 * 60 * 28,
        },
        {
          id: 'm3',
          senderId: '2',
          text: 'Would you like to meet up for coffee to chat about new releases?',
          timestamp: Date.now() - 1000 * 60 * 15,
        },
        {
          id: 'm4',
          senderId: 'current',
          text: 'That sounds great! Where and when?',
          timestamp: Date.now() - 1000 * 60 * 12,
        },
        {
          id: 'm5',
          senderId: '2',
          text: 'How about the café on Main St at 3pm?',
          timestamp: Date.now() - 1000 * 60 * 11,
        },
        {
          id: 'm6',
          senderId: 'current',
          text: 'Perfect, see you there!',
          timestamp: Date.now() - 1000 * 60 * 11,
        },
        {
          id: 'm7',
          senderId: '2',
          text: 'Are you coming?',
          timestamp: Date.now() - 1000 * 60 * 10,
        },
      ],
    },
    {
      id: 'c2',
      participantId: '6',
      participantName: 'Thomas W.',
      profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
      lastMessage: 'Looking forward to it!',
      lastMessageTime: Date.now() - 1000 * 60 * 30,
      messages: [
        {
          id: 'm1',
          senderId: '6',
          text: 'Hey, I saw you were interested in fitness. Do you go to any gyms in the area?',
          timestamp: Date.now() - 1000 * 60 * 120,
        },
        {
          id: 'm2',
          senderId: 'current',
          text: 'Hi Thomas! Yes, I go to Fitness First on George Street. Do you work out there too?',
          timestamp: Date.now() - 1000 * 60 * 118,
        },
        {
          id: 'm3',
          senderId: '6',
          text: 'I usually go to F45 in Surry Hills, but I\'ve been thinking of switching. How\'s Fitness First?',
          timestamp: Date.now() - 1000 * 60 * 110,
        },
        {
          id: 'm4',
          senderId: 'current',
          text: 'It\'s pretty good! Great equipment and not too crowded most times. Want to try a class together?',
          timestamp: Date.now() - 1000 * 60 * 100,
        },
        {
          id: 'm5',
          senderId: '6',
          text: 'That would be awesome. How about Thursday evening?',
          timestamp: Date.now() - 1000 * 60 * 40,
        },
        {
          id: 'm6',
          senderId: 'current',
          text: 'Thursday works for me. 6pm HIIT class?',
          timestamp: Date.now() - 1000 * 60 * 35,
        },
        {
          id: 'm7',
          senderId: '6',
          text: 'Looking forward to it!',
          timestamp: Date.now() - 1000 * 60 * 30,
        },
      ],
    },
  ];
};
