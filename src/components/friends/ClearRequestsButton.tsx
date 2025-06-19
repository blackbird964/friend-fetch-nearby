
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { clearOldFriendRequests } from '@/services/friend-requests/clearOldRequests';
import { toast } from 'sonner';

const ClearRequestsButton: React.FC = () => {
  const { currentUser, refreshFriendRequests } = useAppContext();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearRequests = async () => {
    if (!currentUser) return;
    
    setIsClearing(true);
    try {
      const success = await clearOldFriendRequests(currentUser.id);
      if (success) {
        toast.success('Old requests cleared successfully!');
        await refreshFriendRequests();
      } else {
        toast.error('Failed to clear old requests');
      }
    } catch (error) {
      console.error('Error clearing requests:', error);
      toast.error('Failed to clear old requests');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button 
      onClick={handleClearRequests}
      disabled={isClearing}
      variant="outline"
      size="sm"
      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isClearing ? 'Clearing...' : 'Clear Old Requests'}
    </Button>
  );
};

export default ClearRequestsButton;
