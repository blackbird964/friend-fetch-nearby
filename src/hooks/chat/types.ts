
// Define types for chat functionality
import { MessageStatus, Message } from '@/context/types';

export interface SendMessageOptions {
  optimisticUpdate?: boolean;
}

export interface ChatHookState {
  isLoading: boolean;
  isSending: boolean;
  fetchError: string | null;
  page: number;
  hasMoreMessages: boolean;
}

export interface ChatHookActions {
  setMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  loadMoreMessages: () => void;
}

export interface UseMessagesResult {
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  isSending: boolean; 
  fetchError: string | null;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  hasMoreMessages: boolean;
  loadMoreMessages: () => void;
}
