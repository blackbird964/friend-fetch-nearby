
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';

export const useNearbyUsersRefresh = () => {
  const { refreshNearbyUsers } = useAppContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await refreshNearbyUsers(true);
      toast({
        title: "Refreshed",
        description: "Nearby users list has been updated.",
      });
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast({
        title: "Error",
        description: "Failed to refresh nearby users.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    handleRefresh,
    loading
  };
};
