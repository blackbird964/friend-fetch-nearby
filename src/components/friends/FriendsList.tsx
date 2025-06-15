
import React, { useState } from 'react';
import { AppUser, Chat } from '@/context/types';
import { Button } from '@/components/ui/button';
import { UserPlus, Eye } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';
import FriendshipDetailsModal from './FriendshipDetailsModal';

interface FriendsListProps {
  friends: AppUser[];
  onFriendClick: (chat: Chat) => void;
  onFindFriends: () => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ 
  friends, 
  onFriendClick, 
  onFindFriends 
}) => {
  const [selectedFriend, setSelectedFriend] = useState<AppUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add debugging
  console.log("FriendsList - Received friends:", friends);
  console.log("FriendsList - Friends count:", friends.length);

  const handleViewFriendship = (friend: AppUser) => {
    setSelectedFriend(friend);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFriend(null);
  };

  const handleMessageFriend = () => {
    if (selectedFriend?.chat) {
      onFriendClick(selectedFriend.chat);
      handleCloseModal();
    }
  };

  const handleRemoveFriend = () => {
    if (selectedFriend) {
      // TODO: Implement remove friend functionality
      console.log('Remove friend:', selectedFriend.name);
      handleCloseModal();
    }
  };

  if (friends.length === 0) {
    return (
      <div className="text-center py-10">
        <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No friends yet</h3>
        <p className="text-gray-500 mb-6">
          Find people nearby and send friend requests to connect
        </p>
        <Button onClick={onFindFriends}>
          Find Friends
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Friends ({friends.length})</h3>
          <Button variant="outline" size="sm" onClick={onFindFriends}>
            <UserPlus className="h-4 w-4 mr-2" />
            Find More
          </Button>
        </div>

        <div className="space-y-3">
          {friends.map((friend) => (
            <div 
              key={friend.id}
              className="bg-white border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <UserAvatar
                    src={friend.profile_pic}
                    alt={friend.name || 'Friend'}
                    size="md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{friend.name || 'Friend'}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>{friend.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewFriendship(friend)}
                  className="flex items-center gap-2 shrink-0"
                >
                  <Eye className="h-4 w-4" />
                  View Friendship
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friendship Details Modal */}
      {selectedFriend && (
        <FriendshipDetailsModal
          friend={selectedFriend}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onMessage={handleMessageFriend}
          onRemove={handleRemoveFriend}
        />
      )}
    </>
  );
};

export default FriendsList;
