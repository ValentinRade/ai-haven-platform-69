
import { create } from 'zustand';

interface Chat {
  id: string;
  title: string;
  messages: {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
  }[];
}

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  getCurrentChat: () => Chat | undefined;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChatId: null,
  isLoading: false,
  getCurrentChat: () => {
    const { chats, currentChatId } = get();
    if (!currentChatId) return undefined;
    return chats.find(chat => chat.id === currentChatId);
  },
}));
