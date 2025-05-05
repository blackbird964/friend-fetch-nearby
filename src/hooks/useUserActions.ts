
import { useState, useCallback } from 'react';
import { AppUser } from '@/context/types';
import { blockUser, unblockUser, reportUser as reportUserService } from '@/services/userActionsService';
import { toast } from "sonner";

/**
 * Hook for user actions like blocking, unblocking and reporting users
 */
export const useUserActions = (currentUser: AppUser | null, setCurrentUser: (user: AppUser | null) => void) => {
  const [loading, setLoading] = useState(false);

  // Block user functionality
  const blockUserAction = useCallback(async (userId: string) => {
    if (!currentUser) return false;
    setLoading(true);
    
    try {
      const success = await blockUser(currentUser.id, userId);
      
      if (success) {
        // Update the current user in state with the new blocked users array
        const updatedCurrentUser = { 
          ...currentUser,
          blockedUsers: [...(currentUser.blockedUsers || []), userId]
        };
        setCurrentUser(updatedCurrentUser);
        
        toast.success("User blocked", {
          description: "You won't see this user anymore."
        });
      } else {
        toast.error("Failed to block user", {
          description: "Please try again later."
        });
      }
      
      return success;
    } catch (error) {
      toast.error("Failed to block user", {
        description: "An error occurred."
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, setCurrentUser]);

  // Unblock user functionality
  const unblockUserAction = useCallback(async (userId: string) => {
    if (!currentUser) return false;
    setLoading(true);
    
    try {
      const success = await unblockUser(currentUser.id, userId);
      
      if (success && currentUser.blockedUsers) {
        // Update the current user in state with the new blocked users array
        const updatedCurrentUser = { 
          ...currentUser,
          blockedUsers: currentUser.blockedUsers.filter(id => id !== userId)
        };
        setCurrentUser(updatedCurrentUser);
        
        toast.success("User unblocked");
      } else if (!success) {
        toast.error("Failed to unblock user", {
          description: "Please try again later."
        });
      }
      
      return success;
    } catch (error) {
      toast.error("Failed to unblock user", {
        description: "An error occurred."
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, setCurrentUser]);

  // Report user functionality
  const reportUserAction = useCallback(async (userId: string, reason: string) => {
    if (!currentUser) return false;
    setLoading(true);
    
    try {
      const success = await reportUserService(currentUser.id, userId, reason);
      
      if (success) {
        toast.success("Report submitted", {
          description: "Thank you for helping keep our community safe."
        });
      } else {
        toast.error("Failed to submit report", {
          description: "Please try again later."
        });
      }
      
      return success;
    } catch (error) {
      toast.error("Failed to submit report", {
        description: "An error occurred."
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, setCurrentUser]);

  return {
    blockUser: blockUserAction,
    unblockUser: unblockUserAction,
    reportUser: reportUserAction,
    loading
  };
};
