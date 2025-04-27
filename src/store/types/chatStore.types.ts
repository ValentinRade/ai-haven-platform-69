
import { Chat, ChatMessage } from '@/types/chat';

export interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  setCurrentChat: (chatId: string) => void;
  createNewChat: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  addMessageToCurrentChat: (message: Omit<ChatMessage, 'id'>) => Promise<void>;
  getCurrentChat: () => Chat | undefined;
  loadChats: () => Promise<void>;
}
