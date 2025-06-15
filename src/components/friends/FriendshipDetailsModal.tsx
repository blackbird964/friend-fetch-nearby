
import React, { useState, useEffect } from 'react';
import { AppUser } from '@/context/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, CalendarPlus, UserMinus, Calendar, Clock } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';
import { formatDistanceToNow } from 'date-fns';
import MeetUpModal from './MeetUpModal';
import { getFriendship, removeFriendship, type Friendship } from '@/services/friendships';
import { toast } from 'sonner';

interface FriendshipDetailsModalProps {
  friend: AppUser;
  isOpen: boolean;
  onClose: () => void;
  onMessage: () => void;
  onRemove: () => void;
}

const FriendshipDetailsModal: React.FC<FriendshipDetailsModalProps> = ({
  friend,
  isOpen,
  onClose,
  onMessage,
  onRemove
}) => {
  const [showMeetUpModal, setShowMeetUpModal] = useState(false);
  const [friendship, setFriendship] = useState<Friendship | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch friendship data when modal opens
  useEffect(() => {
    if (isOpen && friend.id) {
      const fetchFriendshipData = async () => {
        setIsLoading(true);
        try {
          const friendshipData = await getFriendship(friend.id);
          setFriendship(friendshipData);
        } catch (error) {
          console.error('Error fetching friendship data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchFriendshipData();
    }
  }, [isOpen, friend.id]);

  // Calculate friendship duration from actual friendship record
  const friendshipStartDate = friendship ? new Date(friendship.created_at) : new Date();
  const friendshipDuration = friendship 
    ? formatDistanceToNow(friendshipStartDate, { addSuffix: false })
    : 'Unknown';
  
  // Set time together to 0 for everyone for now - will be updated when meetups are completed
  const totalTimeSpent = "0h 0m";
  const activitiesCount = 0; // Will be tracked when meetup system is fully implemented

  const handleMeetUp = () => {
    setShowMeetUpModal(true);
  };

  const handleCloseMeetUpModal = () => {
    setShowMeetUpModal(false);
  };

  const handleRemoveFriend = async () => {
    if (!friendship) return;
    
    try {
      const success = await removeFriendship(friend.id);
      if (success) {
        toast.success('Friend removed successfully');
        onRemove();
        onClose();
      } else {
        toast.error('Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  return (
    <>
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
                  {friend.name || 'Friend'}
                </DialogTitle>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-1">
                  <div className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>{friend.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Friendship Stats */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900">Friendship Stats</h3>
              
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading friendship data...</div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Friends for: </span>
                      <span className="font-medium">{friendshipDuration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Time together: </span>
                      <span className="font-medium">{totalTimeSpent}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {friendship 
                      ? `Since ${friendshipStartDate.toLocaleDateString()} • ${activitiesCount} activities`
                      : 'Friendship data not available'
                    }
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onMessage}
                className="w-full flex items-center justify-center gap-2"
                variant="default"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
              
              <Button 
                onClick={handleMeetUp}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <CalendarPlus className="h-4 w-4" />
                Meet Up
              </Button>
              
              <Button 
                onClick={handleRemoveFriend}
                className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                variant="outline"
              >
                <UserMinus className="h-4 w-4" />
                Remove Friend
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meet Up Modal */}
      <MeetUpModal
        friend={friend}
        isOpen={showMeetUpModal}
        onClose={handleCloseMeetUpModal}
      />
    </>
  );
};

export default FriendshipDetailsModal;
