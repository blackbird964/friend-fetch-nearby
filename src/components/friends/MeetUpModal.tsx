import React, { useState } from 'react';
import { AppUser } from '@/context/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';
import { sendMeetupRequest } from '@/services/meet-requests/sendRequest';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';

interface MeetUpModalProps {
  friend: AppUser;
  isOpen: boolean;
  onClose: () => void;
}

const MeetUpModal: React.FC<MeetUpModalProps> = ({
  friend,
  isOpen,
  onClose
}) => {
  const { currentUser } = useAppContext();
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const activities = [
    'Coffee',
    'Lunch',
    'Walk',
    'Study Session',
    'Workout',
    'Shopping',
    'Movie',
    'Gaming',
    'Other'
  ];

  const durations = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' }
  ];

  const handleSendRequest = async () => {
    if (!selectedActivity || !selectedDuration || !currentUser) {
      toast.error('Please select both an activity and duration');
      return;
    }

    setIsLoading(true);
    try {
      const request = await sendMeetupRequest(
        currentUser.id,
        currentUser.name || 'User',
        currentUser.profile_pic || null,
        friend.id,
        friend.name || 'Friend',
        friend.profile_pic || null,
        parseInt(selectedDuration),
        selectedActivity
      );

      if (request) {
        toast.success('Meetup Request Sent!', {
          description: `You've sent a ${selectedDuration} minute ${selectedActivity.toLowerCase()} request to ${friend.name}`
        });
        onClose();
        // Reset form
        setSelectedActivity('');
        setSelectedDuration('');
      } else {
        throw new Error('Failed to send meetup request');
      }
    } catch (error) {
      console.error('Error sending meetup request:', error);
      toast.error('Error', {
        description: 'Failed to send meetup request. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex flex-col items-center space-y-3 mb-4">
            <UserAvatar
              src={friend.profile_pic}
              alt={friend.name || 'Friend'}
              size="lg"
            />
            <div>
              <DialogTitle className="text-xl font-semibold">
                Meet up with {friend.name}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Choose an activity and duration
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Activity Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Activity
            </label>
            <Select value={selectedActivity} onValueChange={setSelectedActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Select an activity" />
              </SelectTrigger>
              <SelectContent>
                {activities.map((activity) => (
                  <SelectItem key={activity} value={activity}>
                    {activity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
            </label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendRequest}
              className="flex-1 flex items-center justify-center gap-2"
              disabled={!selectedActivity || !selectedDuration || isLoading}
            >
              <Calendar className="h-4 w-4" />
              {isLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetUpModal;
