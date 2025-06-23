
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { clearDuplicateRequests } from '@/services/friend-requests';
import { toast } from 'sonner';

const ClearDuplicateRequestsButton: React.FC = () => {
  const { currentUser, refreshFriendRequests } = useAppContext();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearDuplicates = async () => {
    if (!currentUser) return;
    
    setIsClearing(true);
    try {
      const success = await clearDuplicateRequests(currentUser.id);
      
      if (success) {
        toast.success('Duplicate requests cleared');
        await refreshFriendRequests();
      } else {
        toast.error('Failed to clear duplicate requests');
      }
    } catch (error) {
      console.error('Error clearing duplicates:', error);
      toast.error('Failed to clear duplicate requests');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClearDuplicates}
      disabled={isClearing}
      className="text-red-600 border-red-200 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isClearing ? 'Clearing...' : 'Clear Duplicates'}
    </Button>
  );
};

export default ClearDuplicateRequestsButton;
