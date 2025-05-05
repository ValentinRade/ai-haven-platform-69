
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
  isOpen: boolean;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setIsLoading: (isLoading: boolean) => void;
  sendToWebhook: (message: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  isOpen: false,
  webhookUrl: "https://agent.snipe-solutions.de/webhook-test/antragsstrecke",
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
      
      await fetch(state.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          userId: "user-" + Date.now(),
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
}));
