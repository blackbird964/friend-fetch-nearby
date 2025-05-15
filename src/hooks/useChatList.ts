
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { debounce } from 'lodash';
import { useToast } from '@/hooks/use-toast';
import { ChatCacheItem } from './chat/types';
import { fetchConversations, processChatParticipants } from './chat/chatFetcher';
import { useMessageSubscription } from './chat/useSubscription';

export function useChatList() {
  const { currentUser, setChats } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatCacheRef = useRef<Map<string, ChatCacheItem>>(new Map());
  const lastFetchRef = useRef<number>(0);
  const CACHE_TTL = 600000; // 10 minutes cache validity
  const { toast } = useToast(); // Get toast from the useToast hook

  // Debounced fetch function to prevent multiple rapid fetches
  const debouncedFetch = useCallback(
    debounce((forceRefresh: boolean = false) => fetchChats(forceRefresh), 500),
    [currentUser]
  );

  // Fetch chats for current user
  const fetchChats = async (forceRefresh: boolean = false) => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    try {
      const now = Date.now();
      
      // Skip fetching if we've fetched recently, unless forced
      if (!forceRefresh && now - lastFetchRef.current < 30000) {
        console.log("Skipping chat list fetch - throttled");
        return;
      }
      
      setIsLoading(true);
      lastFetchRef.current = now;
      
      // Fetch conversations from Supabase
      const participants = await fetchConversations(currentUser.id);
      
      // Process participants into chat objects
      const { chats: chatsList, unreadCount: totalUnread } = 
        await processChatParticipants(
          participants, 
          currentUser, 
          chatCacheRef.current, 
          now
        );
      
      // Update the chats state
      setChats(chatsList);
      setUnreadCount(totalUnread);
      setLoadError(null);
    } catch (err) {
      console.error('Error loading chats:', err);
      setLoadError('Failed to load chats');
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up message subscription
  useMessageSubscription(currentUser, debouncedFetch);

  // Initial fetch when component mounts
  useEffect(() => {
    if (currentUser) {
      fetchChats();
    }
  }, [currentUser]);

  return { 
    isLoading, 
    loadError, 
    unreadCount, 
    refreshChats: () => fetchChats(true) 
  };
}
