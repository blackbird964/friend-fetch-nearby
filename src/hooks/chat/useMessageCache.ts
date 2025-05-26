
import { useRef } from 'react';
import { Message } from '@/context/types';

export function useMessageCache() {
  const messagesCache = useRef<Map<string, Message[]>>(new Map());

  const getCachedMessages = (chatId: string): Message[] | undefined => {
    return messagesCache.current.get(chatId);
  };

  const setCachedMessages = (chatId: string, messages: Message[]): void => {
    messagesCache.current.set(chatId, messages);
  };

  const updateCachedMessage = (chatId: string, tempId: string, realMessage: Message): void => {
    const cached = messagesCache.current.get(chatId) || [];
    const updatedCache = cached.map(msg => 
      msg.id === tempId ? realMessage : msg
    );
    messagesCache.current.set(chatId, updatedCache);
  };

  const addMessageToCache = (chatId: string, newMessage: Message): void => {
    const cached = messagesCache.current.get(chatId) || [];
    const updatedMessages = [...cached, newMessage];
    messagesCache.current.set(chatId, updatedMessages);
  };

  return {
    getCachedMessages,
    setCachedMessages,
    updateCachedMessage,
    addMessageToCache
  };
}
