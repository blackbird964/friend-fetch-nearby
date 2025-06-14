
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';
import CheckInModal from './CheckInModal';

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
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockCheckIns: CheckIn[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Alex Johnson',
        userPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        interactionDate: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        interactionType: 'meeting',
        status: 'pending',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
        meetingDuration: 60
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Sarah Chen',
        userPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        interactionDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        interactionType: 'chat',
        status: 'completed',
        expiresAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];
    setCheckIns(mockCheckIns);
  }, []);

  const pendingCheckIns = checkIns.filter(checkIn => checkIn.status === 'pending');
  const completedCheckIns = checkIns.filter(checkIn => checkIn.status === 'completed');

  const handleCheckInClick = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    setIsModalOpen(true);
  };

  const handleCheckInComplete = (checkInId: string, feedback: any) => {
    setCheckIns(prev => prev.map(checkIn => 
      checkIn.id === checkInId 
        ? { ...checkIn, status: 'completed' as const }
        : checkIn
    ));
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
                        <span>{checkIn.interactionType === 'meeting' ? 'Met up' : 'Chatted'}</span>
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
      {completedCheckIns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            Recent Check-ins
          </h3>
          <div className="space-y-3">
            {completedCheckIns.map((checkIn) => (
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
                        <span>{checkIn.interactionType === 'meeting' ? 'Met up' : 'Chatted'}</span>
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
            Your check-ins will appear here after you chat or meet with someone
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
