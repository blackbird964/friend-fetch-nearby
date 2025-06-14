
import React from 'react';
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

interface FriendshipDetailsModalProps {
  friend: AppUser;
  isOpen: boolean;
  onClose: () => void;
  onMessage: () => void;
  onMeetUp: () => void;
  onRemove: () => void;
}

const FriendshipDetailsModal: React.FC<FriendshipDetailsModalProps> = ({
  friend,
  isOpen,
  onClose,
  onMessage,
  onMeetUp,
  onRemove
}) => {
  // Calculate friendship duration (using chat creation date as proxy)
  const friendshipStartDate = friend.chat?.createdAt ? new Date(friend.chat.createdAt) : new Date();
  const friendshipDuration = formatDistanceToNow(friendshipStartDate, { addSuffix: false });
  
  // Mock data for total time spent together (this would come from actual activity data)
  const totalTimeSpent = "2h 30m";
  const activitiesCount = 3;

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
              Since {friendshipStartDate.toLocaleDateString()} • {activitiesCount} activities
            </div>
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
              onClick={onMeetUp}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <CalendarPlus className="h-4 w-4" />
              Meet Up
            </Button>
            
            <Button 
              onClick={onRemove}
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
  );
};

export default FriendshipDetailsModal;
