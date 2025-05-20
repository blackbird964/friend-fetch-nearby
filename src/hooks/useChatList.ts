
import { useFetchChats } from './chat/useFetchChats';
import { useCreateChat } from './chat/useCreateChat';
import { useAppContext } from '@/context/AppContext';

export function useChatList() {
  const { chats, setChats } = useAppContext();
  const { isLoading, loadError, unreadCount } = useFetchChats();
  const { createChat } = useCreateChat();

  return { 
    isLoading, 
    loadError, 
    unreadCount,
    chats,
    setChats,
    createChat
  };
}
