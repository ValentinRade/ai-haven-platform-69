
import { create } from 'zustand';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
}

export const useChatStore = create<ChatStore>(() => ({
  messages: [],
  isLoading: false,
}));
