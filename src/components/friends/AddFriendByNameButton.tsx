
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { addFriendByName } from '@/services/friendships/directFriendship';

const AddFriendByNameButton: React.FC = () => {
  const { currentUser, refreshFriendRequests } = useAppContext();
  const [friendName, setFriendName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFriend = async () => {
    if (!currentUser || !friendName.trim()) return;
    
    setIsLoading(true);
    try {
      const success = await addFriendByName(currentUser.id, friendName.trim());
      if (success) {
        setFriendName('');
        await refreshFriendRequests();
      }
    } catch (error) {
      console.error('Error adding friend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 p-4 border rounded-lg bg-gray-50">
      <Input
        placeholder="Enter friend's name"
        value={friendName}
        onChange={(e) => setFriendName(e.target.value)}
        className="flex-1"
      />
      <Button 
        onClick={handleAddFriend}
        disabled={isLoading || !friendName.trim()}
        size="sm"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {isLoading ? 'Adding...' : 'Add Friend'}
      </Button>
    </div>
  );
};

export default AddFriendByNameButton;
