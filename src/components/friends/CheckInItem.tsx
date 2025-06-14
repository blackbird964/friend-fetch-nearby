
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Calendar, Clock } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';

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

interface CheckInItemProps {
  checkIn: CheckIn;
  onCheckInClick?: (checkIn: CheckIn) => void;
  showButton?: boolean;
  buttonText?: string;
  variant?: 'pending' | 'completed';
}

const CheckInItem: React.FC<CheckInItemProps> = ({ 
  checkIn, 
  onCheckInClick, 
  showButton = false,
  buttonText = 'Check In',
  variant = 'pending'
}) => {
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

  const getInteractionIcon = () => {
    switch (checkIn.interactionType) {
      case 'meetup_request':
        return <Calendar className="h-3 w-3" />;
      case 'meeting':
        return <Clock className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getInteractionText = () => {
    switch (checkIn.interactionType) {
      case 'meetup_request':
        return `Wants to meet for ${checkIn.activity} (${checkIn.meetingDuration}min)`;
      case 'meeting':
        return 'Met up';
      default:
        return 'Chatted';
    }
  };

  const containerClass = variant === 'pending' 
    ? checkIn.interactionType === 'meetup_request' 
      ? 'bg-blue-50 border border-blue-200 rounded-lg p-4'
      : 'bg-orange-50 border border-orange-200 rounded-lg p-4'
    : 'bg-green-50 border border-green-200 rounded-lg p-4';

  const getButtonText = () => {
    if (checkIn.interactionType === 'meetup_request') {
      return 'Respond';
    }
    return buttonText;
  };

  return (
    <div className={containerClass}>
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
              {getInteractionIcon()}
              <span>{getInteractionText()}</span>
              <span>•</span>
              <span>{formatTimeAgo(checkIn.interactionDate)}</span>
            </div>
            {variant === 'pending' && (
              <div className={`text-xs mt-1 ${
                checkIn.interactionType === 'meetup_request' ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {formatTimeUntilExpiry(checkIn.expiresAt)}
              </div>
            )}
          </div>
        </div>
        {showButton && onCheckInClick && (
          <Button 
            onClick={() => onCheckInClick(checkIn)}
            className={
              checkIn.interactionType === 'meetup_request' 
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-orange-500 hover:bg-orange-600'
            }
          >
            {getButtonText()}
          </Button>
        )}
        {variant === 'completed' && (
          <div className="text-green-600 text-sm font-medium">
            ✓ Completed
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInItem;
