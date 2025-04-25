
import { create } from 'zustand';
import { ChatStore } from './types/chatStore.types';
import { createChatActions } from './actions/chatActions';
import { createMessageActions } from './actions/messageActions';
import { createLoadActions } from './actions/loadActions';

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChatId: null,
  getCurrentChat: () => {
    const { chats, currentChatId } = get();
    return chats.find(chat => chat.id === currentChatId);
  },
  ...createChatActions(set, get),
  ...createMessageActions(set, get),
  ...createLoadActions(set, get)
}));
