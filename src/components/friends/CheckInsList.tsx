
import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import CheckInModal from './CheckInModal';
import PendingCheckInsSection from './PendingCheckInsSection';
import CompletedCheckInsSection from './CompletedCheckInsSection';
import EmptyCheckInsState from './EmptyCheckInsState';

interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  interactionDate: Date;
  interactionType: 'chat' | 'meeting' | 'meetup_request';
  status: 'pending' | 'completed' | 'expired';
  expiresAt: Date;
  meetingDuration?: number;
  activity?: string;
}

const CheckInsList: React.FC = () => {
  const { chats, meetupRequests, currentUser } = useAppContext();
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedCheckIns, setCompletedCheckIns] = useState<string[]>([]);

  // Get list of friend IDs from chats (deduplicated)
  const friendIds = useMemo(() => {
    const ids = new Set<string>();
    chats.forEach(chat => {
      if (chat.participantId) {
        ids.add(chat.participantId);
      }
    });
    return ids;
  }, [chats]);

  // Generate check-ins from real chat data and meetup requests
  const checkIns = useMemo(() => {
    const chatCheckIns = chats.map(chat => {
      const lastMessageTime = chat.lastMessageTime || Date.now();
      const interactionDate = new Date(lastMessageTime);
      const now = new Date();
      const timeSinceInteraction = now.getTime() - interactionDate.getTime();
      const minutesSinceInteraction = Math.floor(timeSinceInteraction / (1000 * 60));
      
      // Show check-in if interaction was within last 24 hours but more than 30 minutes ago
      const shouldShowCheckIn = minutesSinceInteraction >= 30 && minutesSinceInteraction <= 1440; // 30 minutes to 24 hours
      
      // Skip if this person is already a friend or if we shouldn't show check-in
      if (!shouldShowCheckIn || !chat.participantId || friendIds.has(chat.participantId)) {
        return null;
      }
      
      const isCompleted = completedCheckIns.includes(chat.id);
      const expiresAt = new Date(interactionDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours after interaction
      
      return {
        id: chat.id,
        userId: chat.participantId,
        userName: chat.participantName || chat.name || 'Unknown User',
        userPhoto: chat.profilePic,
        interactionDate,
        interactionType: 'chat' as const,
        status: isCompleted ? 'completed' as const : 'pending' as const,
        expiresAt,
        meetingDuration: undefined
      };
    }).filter(Boolean) as CheckIn[];

    // Add meetup requests as check-ins where current user is the receiver
    const meetupCheckIns = meetupRequests
      .filter(request => 
        request.receiverId === currentUser?.id && 
        request.status === 'pending'
      )
      .map(request => {
        const requestDate = new Date(request.timestamp);
        const expiresAt = new Date(requestDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours to respond
        
        return {
          id: request.id,
          userId: request.senderId,
          userName: request.senderName,
          userPhoto: request.senderProfilePic,
          interactionDate: requestDate,
          interactionType: 'meetup_request' as const,
          status: 'pending' as const,
          expiresAt,
          meetingDuration: parseInt(request.duration),
          activity: request.meetLocation
        };
      });

    return [...chatCheckIns, ...meetupCheckIns];
  }, [chats, meetupRequests, currentUser, completedCheckIns, friendIds]);

  const pendingCheckIns = checkIns.filter(checkIn => checkIn.status === 'pending');
  const completedCheckInsData = checkIns.filter(checkIn => checkIn.status === 'completed');

  const handleCheckInClick = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    setIsModalOpen(true);
  };

  const handleCheckInComplete = (checkInId: string, feedback: any) => {
    setCompletedCheckIns(prev => [...prev, checkInId]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PendingCheckInsSection 
        checkIns={pendingCheckIns}
        onCheckInClick={handleCheckInClick}
      />

      <CompletedCheckInsSection 
        checkIns={completedCheckInsData}
      />

      {checkIns.length === 0 && <EmptyCheckInsState />}

      {/* Check-in Modal */}
      {selectedCheckIn && (
        <CheckInModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          checkIn={selectedCheckIn}
          onComplete={handleCheckInComplete}
        />
      )}
    </div>
  );
};

export default CheckInsList;
