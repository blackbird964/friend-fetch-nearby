
import { useRef } from 'react';
import { Message } from '@/context/types';

/**
 * Hook that provides cache functionality for messages
 */
export function useMessageCache() {
  const messagesCache = useRef<Record<string, Message[]>>({});
  const lastFetchTime = useRef<Record<string, number>>({});
  const CACHE_TTL = 120000; // 2 minutes cache validity

  const getCachedMessages = (chatId: string) => {
    return messagesCache.current[chatId] || [];
  };

  const setCachedMessages = (chatId: string, messages: Message[]) => {
    messagesCache.current[chatId] = messages;
    lastFetchTime.current[chatId] = Date.now();
  };

  const addMessageToCache = (chatId: string, message: Message) => {
    const currentMessages = messagesCache.current[chatId] || [];
    messagesCache.current[chatId] = [...currentMessages, message];
  };

  const isCacheValid = (chatId: string) => {
    const now = Date.now();
    const lastFetch = lastFetchTime.current[chatId] || 0;
    return (
      messagesCache.current[chatId]?.length > 0 && 
      now - lastFetch < CACHE_TTL
    );
  };

  return {
    getCachedMessages,
    setCachedMessages,
    addMessageToCache,
    isCacheValid,
    CACHE_TTL
  };
}
