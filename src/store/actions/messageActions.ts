
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ChatMessage } from '@/types/chat';
import { ChatStore } from '../types/chatStore.types';

export const createMessageActions = (set: Function, get: () => ChatStore) => ({
  addMessageToCurrentChat: async (message: Omit<ChatMessage, 'id'>) => {
    const { currentChatId } = get();
    if (!currentChatId) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        console.error('User not authenticated');
        return;
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChatId,
          content: message.content,
          type: message.type
        })
        .select()
        .single();

      if (error) throw error;

      set((state: ChatStore) => {
        const updatedChats = state.chats.map((chat) => {
          if (chat.id === currentChatId) {
            const newMessage = {
              id: data.id,
              type: message.type,
              content: message.content,
              timestamp: new Date(data.created_at)
            };
            
            return {
              ...chat,
              lastMessage: message.content,
              timestamp: new Date(),
              messages: [...chat.messages, newMessage]
            };
          }
          return chat;
        });

        const currentChat = updatedChats.find(c => c.id === currentChatId);
        const otherChats = updatedChats.filter(c => c.id !== currentChatId);
        return { 
          chats: currentChat ? [currentChat, ...otherChats] : updatedChats 
        };
      });
    } catch (error) {
      console.error('Error adding message:', error);
      toast({
        title: "Fehler beim Senden der Nachricht",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    }
  }
});
