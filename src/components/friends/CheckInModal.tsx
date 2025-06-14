
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Heart, UserPlus, Ban, Flag } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';
import { toast } from 'sonner';

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

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn: CheckIn;
  onComplete: (checkInId: string, feedback: CheckInFeedback) => void;
}

interface CheckInFeedback {
  didMeet: boolean;
  rating?: number;
  connectionPreference: 'friend' | 'maybe' | 'no' | 'block';
}

const CheckInModal: React.FC<CheckInModalProps> = ({ 
  isOpen, 
  onClose, 
  checkIn, 
  onComplete 
}) => {
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState<CheckInFeedback>({
    didMeet: false,
    connectionPreference: 'maybe'
  });

  const handleMeetingConfirmation = (didMeet: boolean) => {
    setFeedback(prev => ({ ...prev, didMeet }));
    setStep(didMeet ? 2 : 3);
  };

  const handleRating = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
    setStep(3);
  };

  const handleConnectionPreference = (preference: CheckInFeedback['connectionPreference']) => {
    const finalFeedback = { ...feedback, connectionPreference: preference };
    setFeedback(finalFeedback);
    
    // Show appropriate feedback message
    switch (preference) {
      case 'friend':
        toast.success('Friend request sent!', {
          description: `You've added ${checkIn.userName} as a friend.`
        });
        break;
      case 'maybe':
        toast.info('Maybe later', {
          description: 'You can always connect later if you change your mind.'
        });
        break;
      case 'no':
        toast.info('No connection made', {
          description: 'No worries, you won\'t see each other in suggestions.'
        });
        break;
      case 'block':
        toast.success('User blocked', {
          description: 'They won\'t be able to contact you again.'
        });
        break;
    }
    
    onComplete(checkIn.id, finalFeedback);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4">
                <UserAvatar
                  src={checkIn.userPhoto}
                  alt={checkIn.userName}
                  size="lg"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                How was your time with {checkIn.userName}?
              </h3>
              <p className="text-gray-600 text-sm">
                {checkIn.interactionType === 'meeting' 
                  ? 'Let us know if you met up and how it went'
                  : 'Tell us about your chat experience'
                }
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-medium text-center">Did you meet up?</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => handleMeetingConfirmation(true)}
                >
                  Yes, we met
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => handleMeetingConfirmation(false)}
                >
                  No, just chatted
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">How was your meeting?</h3>
              <p className="text-gray-600 text-sm">Rate your experience (optional)</p>
            </div>

            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      feedback.rating && feedback.rating >= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={() => setStep(3)}>
                Skip rating
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Stay connected with {checkIn.userName}?
              </h3>
              <p className="text-gray-600 text-sm">
                Choose how you'd like to proceed
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleConnectionPreference('friend')}
                className="w-full h-12 bg-green-500 hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Add as Friend
              </Button>

              <Button
                variant="outline"
                onClick={() => handleConnectionPreference('maybe')}
                className="w-full h-12 flex items-center justify-center gap-2"
              >
                <Heart className="h-5 w-5" />
                Maybe Later
              </Button>

              <Button
                variant="outline"
                onClick={() => handleConnectionPreference('no')}
                className="w-full h-12 flex items-center justify-center gap-2 text-gray-600"
              >
                No Thanks
              </Button>

              <Button
                variant="outline"
                onClick={() => handleConnectionPreference('block')}
                className="w-full h-12 flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Ban className="h-5 w-5" />
                Block User
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Check-in</DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default CheckInModal;
