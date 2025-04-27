
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Chat, ChatMessage } from '@/types/chat';
import { formatChat } from '../utils/chatUtils';
import { ChatStore } from '../types/chatStore.types';

export const createChatActions = (set: Function, get: () => ChatStore) => ({
  setCurrentChat: (chatId: string) => {
    set({ currentChatId: chatId });
  },

  createNewChat: async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        toast({
          title: "Nicht angemeldet",
          description: "Bitte melden Sie sich an, um einen Chat zu erstellen.",
          variant: "destructive"
        });
        return;
      }
      
      const userId = session.session.user.id;
      const userDisplayName = session.session.user.user_metadata.display_name || 
                           session.session.user.email.split('@')[0];
      
      try {
        const { data, error } = await supabase
          .from('chats')
          .insert({
            title: 'Neuer Chat', 
            user_id: userId,
            creator_display_name: userDisplayName
          })
          .select()
          .single();

        if (error) throw error;

        const newChat: Chat = {
          id: data.id,
          title: data.title,
          lastMessage: '',
          timestamp: new Date(data.created_at || data.updated_at),
          creator_display_name: userDisplayName,
          is_private: false,
          messages: []
        };

        set((state: ChatStore) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id
        }));
      } catch (error) {
        console.error('Error creating chat:', error);
        toast({
          title: "Fehler beim Erstellen des Chats",
          description: "Bitte versuchen Sie es später erneut.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Fehler beim Erstellen des Chats",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
        });
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      set((state: ChatStore) => ({
        chats: state.chats.filter((chat) => chat.id !== chatId),
        currentChatId: state.currentChatId === chatId ? 
          (state.chats.length > 1 ? state.chats.find(c => c.id !== chatId)?.id : null) : 
          state.currentChatId
      }));

      toast({
        title: "Chat gelöscht",
        description: "Der Chat wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Fehler beim Löschen des Chats",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    }
  }
});
