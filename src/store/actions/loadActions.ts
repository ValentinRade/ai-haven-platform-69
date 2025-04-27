
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ChatStore } from '../types/chatStore.types';
import { formatChat } from '../utils/chatUtils';

export const createLoadActions = (set: Function, get: () => ChatStore) => ({
  loadChats: async () => {
    try {
      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        console.log('User not authenticated, skipping chat load');
        return;
      }

      // Set loading state
      set({ isLoading: true });

      try {
        const { data, error } = await supabase
          .from('chats')
          .select(`
            id,
            title,
            updated_at,
            creator_display_name,
            is_private,
            messages (
              id,
              content,
              type,
              duration,
              created_at
            )
          `)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error loading chats:', error);
          toast({
            title: "Fehler beim Laden der Chats",
            description: "Bitte versuchen Sie es später erneut.",
            variant: "destructive"
          });
          set({ isLoading: false });
          return;
        }

        if (data) {
          // Format the chats and update state
          const formattedChats = data.map((chat) => formatChat(chat));
          
          set({ 
            chats: formattedChats,
            isLoading: false 
          });
          
          // If no current chat is selected and we have chats, select the first one
          if (!get().currentChatId && formattedChats.length > 0) {
            set({ currentChatId: formattedChats[0].id });
          }
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        toast({
          title: "Fehler beim Laden der Chats",
          description: "Bitte versuchen Sie es später erneut.",
          variant: "destructive"
        });
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: "Fehler beim Laden der Chats",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
      set({ isLoading: false });
    }
  }
});
