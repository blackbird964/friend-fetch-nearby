
import { useState } from 'react';
import { AppUser } from '@/context/types';
import { useChatActions } from './useChatActions';
import { useFriendActions } from './useFriendActions';
import { useNearbyUsersRefresh } from './useNearbyUsersRefresh';

export const useUserActions = () => {
  const { startChat } = useChatActions();
  const { handleAddFriend, loading: friendActionLoading } = useFriendActions();
  const { handleRefresh, loading: refreshLoading } = useNearbyUsersRefresh();

  // Combine loading states from the different hooks
  const loading = friendActionLoading || refreshLoading;

  return {
    startChat,
    handleAddFriend,
    handleRefresh,
    loading
  };
};
