
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
  webhookUrl: string;
  userId: string;
  chatId: string;
  setWebhookUrl: (url: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setIsLoading: (isLoading: boolean) => void;
  sendToWebhook: (message: string) => Promise<void>;
}

// Generate a unique user ID
const generateUserId = () => `user-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;

// Generate a unique chat ID
const generateChatId = () => `chat-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      isOpen: false,
      webhookUrl: "https://agent.snipe-solutions.de/webhook-test/antragsstrecke",
      userId: generateUserId(), // Generate a unique ID when the store is created
      chatId: generateChatId(), // Generate a unique chat ID when the store is created
      setWebhookUrl: (url) => set({ webhookUrl: url }),
      setIsOpen: (isOpen) => set({ isOpen }),
      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: Date.now().toString(),
            timestamp: new Date()
          }
        ]
      })),
      setIsLoading: (isLoading) => set({ isLoading }),
      sendToWebhook: async (message) => {
        const state = get();
        try {
          console.log("Sending message to webhook:", message);
          console.log("User ID:", state.userId);
          console.log("Chat ID:", state.chatId);
          
          await fetch(state.webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: message,
              userId: state.userId,
              chatId: state.chatId, // Include the chat ID in the webhook payload
              timestamp: new Date().toISOString(),
              conversation: state.messages.map(msg => ({
                content: msg.content,
                isUser: msg.isUser
              }))
            }),
          });
          
          return Promise.resolve();
        } catch (error) {
          console.error("Error sending message to webhook:", error);
          return Promise.reject(error);
        }
      }
    }),
    {
      name: 'chat-storage', // Name for localStorage
      partialize: (state) => ({ 
        userId: state.userId, // Persist the userId
        chatId: state.chatId, // Also persist the chatId
        messages: state.messages // Also persist messages to maintain conversation history
      }),
    }
  )
);
