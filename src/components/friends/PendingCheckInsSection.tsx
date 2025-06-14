
import React from 'react';
import { Clock } from 'lucide-react';
import CheckInItem from './CheckInItem';

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

interface PendingCheckInsSectionProps {
  checkIns: CheckIn[];
  onCheckInClick: (checkIn: CheckIn) => void;
}

const PendingCheckInsSection: React.FC<PendingCheckInsSectionProps> = ({ 
  checkIns, 
  onCheckInClick 
}) => {
  if (checkIns.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        Pending Check-ins ({checkIns.length})
      </h3>
      <div className="space-y-3">
        {checkIns.map((checkIn) => (
          <CheckInItem
            key={checkIn.id}
            checkIn={checkIn}
            onCheckInClick={onCheckInClick}
            showButton={true}
            buttonText="Check In"
            variant="pending"
          />
        ))}
      </div>
    </div>
  );
};

export default PendingCheckInsSection;
