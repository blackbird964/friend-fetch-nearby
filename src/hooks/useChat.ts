
import { useState } from 'react';
import { useFetchConversation } from './chat/useFetchConversation';
import { useRealTimeMessages } from './chat/useRealTimeMessages';
import { useSendMessage } from './chat/useSendMessage';

export function useChat(selectedChatId: string | null) {
  const [message, setMessage] = useState('');
  
  const { isLoading, fetchError } = useFetchConversation(selectedChatId);
  const { handleSendMessage, isSending } = useSendMessage();
  
  // Set up real-time message subscription
  useRealTimeMessages();

  const handleSendMessageWrapper = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSendMessage(message);
    setMessage(''); // Clear input after sending
  };

  return {
    message,
    setMessage,
    isLoading,
    fetchError,
    handleSendMessage: handleSendMessageWrapper
  };
}

export default useChat;
