
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';
import CheckInModal from './CheckInModal';
import { useAppContext } from '@/context/AppContext';

interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  interactionDate: Date;
  interactionType: 'chat' | 'meeting';
  status: 'pending' | 'completed' | 'expired';
  expiresAt: Date;
  meetingDuration?: number;
}

const CheckInsList: React.FC = () => {
  const { chats } = useAppContext();
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedCheckIns, setCompletedCheckIns] = useState<string[]>([]);

  // Generate check-ins from real chat data
  const checkIns = useMemo(() => {
    return chats.map(chat => {
      const lastMessageTime = chat.lastMessageTime || Date.now();
      const interactionDate = new Date(lastMessageTime);
      const now = new Date();
      const timeSinceInteraction = now.getTime() - interactionDate.getTime();
      const minutesSinceInteraction = Math.floor(timeSinceInteraction / (1000 * 60));
      
      // Show check-in if interaction was within last 24 hours but more than 30 minutes ago
      const shouldShowCheckIn = minutesSinceInteraction >= 30 && minutesSinceInteraction <= 1440; // 30 minutes to 24 hours
      
      if (!shouldShowCheckIn) return null;
      
      const isCompleted = completedCheckIns.includes(chat.id);
      const expiresAt = new Date(interactionDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours after interaction
      
      return {
        id: chat.id,
        userId: chat.participantId || '',
        userName: chat.participantName || chat.name || 'Unknown User',
        userPhoto: chat.profilePic,
        interactionDate,
        interactionType: 'chat' as const,
        status: isCompleted ? 'completed' as const : 'pending' as const,
        expiresAt,
        meetingDuration: undefined
      };
    }).filter(Boolean) as CheckIn[];
  }, [chats, completedCheckIns]);

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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatTimeUntilExpiry = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins <= 0) return 'Expired';
    if (diffMins < 60) return `${diffMins}m left`;
    return `${diffHours}h ${diffMins % 60}m left`;
  };

  return (
    <div className="space-y-6">
      {/* Pending Check-ins */}
      {pendingCheckIns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Pending Check-ins ({pendingCheckIns.length})
          </h3>
          <div className="space-y-3">
            {pendingCheckIns.map((checkIn) => (
              <div 
                key={checkIn.id}
                className="bg-orange-50 border border-orange-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserAvatar
                      src={checkIn.userPhoto}
                      alt={checkIn.userName}
                      size="md"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{checkIn.userName}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MessageSquare className="h-3 w-3" />
                        <span>Chatted</span>
                        <span>•</span>
                        <span>{formatTimeAgo(checkIn.interactionDate)}</span>
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        {formatTimeUntilExpiry(checkIn.expiresAt)}
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleCheckInClick(checkIn)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Check In
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Check-ins */}
      {completedCheckInsData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            Recent Check-ins
          </h3>
          <div className="space-y-3">
            {completedCheckInsData.map((checkIn) => (
              <div 
                key={checkIn.id}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserAvatar
                      src={checkIn.userPhoto}
                      alt={checkIn.userName}
                      size="md"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{checkIn.userName}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MessageSquare className="h-3 w-3" />
                        <span>Chatted</span>
                        <span>•</span>
                        <span>{formatTimeAgo(checkIn.interactionDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-green-600 text-sm font-medium">
                    ✓ Completed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {checkIns.length === 0 && (
        <div className="text-center py-10">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No recent interactions</h3>
          <p className="text-gray-500">
            Your check-ins will appear here after you chat with someone
          </p>
        </div>
      )}

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
