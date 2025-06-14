
import React from 'react';
import { ThumbsUp } from 'lucide-react';
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

interface CompletedCheckInsSectionProps {
  checkIns: CheckIn[];
}

const CompletedCheckInsSection: React.FC<CompletedCheckInsSectionProps> = ({ 
  checkIns 
}) => {
  if (checkIns.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ThumbsUp className="h-5 w-5 text-green-500" />
        Recent Check-ins
      </h3>
      <div className="space-y-3">
        {checkIns.map((checkIn) => (
          <CheckInItem
            key={checkIn.id}
            checkIn={checkIn}
            variant="completed"
          />
        ))}
      </div>
    </div>
  );
};

export default CompletedCheckInsSection;
