
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Calendar, Clock } from 'lucide-react';
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

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn: CheckIn;
  onComplete: (checkInId: string, feedback: any) => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  checkIn,
  onComplete
}) => {
  const [didMeet, setDidMeet] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [connectionPreference, setConnectionPreference] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const handleSubmit = () => {
    const feedbackData = {
      didMeet: didMeet === 'yes',
      rating: didMeet === 'yes' ? rating : null,
      connectionPreference,
      feedback
    };
    
    onComplete(checkIn.id, feedbackData);
    onClose();
    
    // Reset form
    setDidMeet('');
    setRating(0);
    setConnectionPreference('');
    setFeedback('');
  };

  const getInteractionIcon = () => {
    switch (checkIn.interactionType) {
      case 'meetup_request':
        return <Calendar className="h-4 w-4" />;
      case 'meeting':
        return <Clock className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getInteractionText = () => {
    switch (checkIn.interactionType) {
      case 'meetup_request':
        return `Meetup request for ${checkIn.activity} (${checkIn.meetingDuration}min)`;
      case 'meeting':
        return 'In-person meeting';
      default:
        return 'Chat conversation';
    }
  };

  const getModalTitle = () => {
    switch (checkIn.interactionType) {
      case 'meetup_request':
        return 'Meetup Request Response';
      default:
        return 'Check-in with';
    }
  };

  const getSubmitButtonText = () => {
    switch (checkIn.interactionType) {
      case 'meetup_request':
        return 'Respond to Request';
      default:
        return 'Complete Check-in';
    }
  };

  if (checkIn.interactionType === 'meetup_request') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <UserAvatar
                src={checkIn.userPhoto}
                alt={checkIn.userName}
                size="md"
              />
              <div>
                <h4 className="font-medium">{checkIn.userName}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {getInteractionIcon()}
                  <span>{getInteractionText()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Response</Label>
                <RadioGroup value={connectionPreference} onValueChange={setConnectionPreference}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="accept" id="accept" />
                    <Label htmlFor="accept">Accept meetup</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="decline" id="decline" />
                    <Label htmlFor="decline">Decline meetup</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="feedback" className="text-sm font-medium">
                  Message (optional)
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Add a message..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!connectionPreference}
              >
                {getSubmitButtonText()}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getModalTitle()} {checkIn.userName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <UserAvatar
              src={checkIn.userPhoto}
              alt={checkIn.userName}
              size="md"
            />
            <div>
              <h4 className="font-medium">{checkIn.userName}</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {getInteractionIcon()}
                <span>{getInteractionText()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Did you meet up in person?</Label>
              <RadioGroup value={didMeet} onValueChange={setDidMeet}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes, we met in person</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No, we didn't meet</Label>
                </div>
              </RadioGroup>
            </div>

            {didMeet === 'yes' && (
              <div>
                <Label className="text-sm font-medium">How was your experience?</Label>
                <div className="flex space-x-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">Would you like to connect with them again?</Label>
              <RadioGroup value={connectionPreference} onValueChange={setConnectionPreference}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="connect-yes" />
                  <Label htmlFor="connect-yes">Yes, I'd like to hang out again</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="connect-no" />
                  <Label htmlFor="connect-no">No, not interested</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maybe" id="connect-maybe" />
                  <Label htmlFor="connect-maybe">Maybe in the future</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="feedback" className="text-sm font-medium">
                Additional feedback (optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts about this interaction..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!didMeet || !connectionPreference}
            >
              {getSubmitButtonText()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInModal;
