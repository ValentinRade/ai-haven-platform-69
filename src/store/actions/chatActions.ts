
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
      set({ isLoading: true });
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        console.error('No active session found when creating chat');
        toast({
          title: "Nicht angemeldet",
          description: "Bitte melden Sie sich an, um einen Chat zu erstellen.",
          variant: "destructive"
        });
        set({ isLoading: false });
        return;
      }
      
      const userId = session.session.user.id;
      console.log('Creating new chat for user:', userId);
      
      const userDisplayName = session.session.user.user_metadata.display_name || 
                           session.session.user.email.split('@')[0];
      
      try {
        console.log('Attempting to insert new chat into database');
        const { data, error } = await supabase
          .from('chats')
          .insert({
            title: 'Neuer Chat', 
            user_id: userId,
            creator_display_name: userDisplayName
          })
          .select()
          .single();

        // Log the raw response for debugging
        console.log('Chat creation response:', { data, error });

        if (error) {
          console.error('Error creating chat in database:', error);
          throw error;
        }

        if (!data) {
          console.error('No data returned after creating chat');
          throw new Error('No data returned from database');
        }

        console.log('Successfully created new chat:', data.id);

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
          currentChatId: newChat.id,
          isLoading: false
        }));
        
        toast({
          title: "Chat erstellt",
          description: "Neuer Chat wurde erfolgreich erstellt.",
        });
      } catch (error: any) {
        console.error('Error creating chat:', error);
        
        // Provide specific error messages based on error codes
        if (error.code === 'PGRST116') {
          toast({
            title: "Keine Berechtigung",
            description: "Sie haben keine Berechtigung, einen Chat zu erstellen. Bitte melden Sie sich erneut an.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Fehler beim Erstellen des Chats",
            description: error.message || "Bitte versuchen Sie es später erneut.",
            variant: "destructive"
          });
        }
        
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error in createNewChat:', error);
      toast({
        title: "Fehler beim Erstellen des Chats",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
        });
      set({ isLoading: false });
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) {
        console.error('Error deleting chat:', error);
        throw error;
      }

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
