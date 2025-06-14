
import React from 'react';
import { AppUser, Chat } from '@/context/types';
import { Button } from '@/components/ui/button';
import { UserPlus, MessageCircle, CalendarPlus, UserMinus } from 'lucide-react';
import UserAvatar from '@/components/users/cards/UserAvatar';

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
  const handleMessageFriend = (friend: AppUser) => {
    if (friend.chat) {
      onFriendClick(friend.chat);
    }
  };

  const handleRemoveFriend = (friend: AppUser) => {
    // TODO: Implement remove friend functionality
    console.log('Remove friend:', friend.name);
    // This would typically call a service to remove the friendship
    // and update the local state
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
              <div className="flex items-center space-x-3">
                <UserAvatar
                  src={friend.profile_pic}
                  alt={friend.name || 'Friend'}
                  size="md"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{friend.name || 'Friend'}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>{friend.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMessageFriend(friend)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    // TODO: Implement meet up request flow
                    console.log('Request meetup with', friend.name);
                  }}
                >
                  <CalendarPlus className="h-4 w-4" />
                  Meet Up
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRemoveFriend(friend)}
                  className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <UserMinus className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
