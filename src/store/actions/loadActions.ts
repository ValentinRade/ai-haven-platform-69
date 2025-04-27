
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ChatStore } from '../types/chatStore.types';
import { formatChat } from '../utils/chatUtils';

export const createLoadActions = (set: Function, get: () => ChatStore) => ({
  loadChats: async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        console.log('User not authenticated, skipping chat load');
        return;
      }

      // Add retry logic
      const maxRetries = 3;
      let retries = 0;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          const { data, error } = await supabase
            .from('chats')
            .select(`
              id,
              title,
              updated_at,
              creator_display_name,
              messages (
                id,
                content,
                type,
                created_at
              )
            `)
            .order('updated_at', { ascending: false });

          if (error) {
            console.error(`Error loading chats (attempt ${retries + 1}/${maxRetries}):`, error);
            retries++;
            if (retries >= maxRetries) {
              toast({
                title: "Fehler beim Laden der Chats",
                description: "Bitte versuchen Sie es später erneut.",
                variant: "destructive"
              });
              return;
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            continue;
          }

          if (data) {
            // Explicitly type the data to match what formatChat expects
            const formattedChats = data.map((chat) => formatChat(chat));
            
            set({ chats: formattedChats });
            
            if (!get().currentChatId && formattedChats.length > 0) {
              set({ currentChatId: formattedChats[0].id });
            }
          }
          success = true;
        } catch (error) {
          console.error(`Error loading chats (attempt ${retries + 1}/${maxRetries}):`, error);
          retries++;
          if (retries >= maxRetries) {
            toast({
              title: "Fehler beim Laden der Chats",
              description: "Bitte versuchen Sie es später erneut.",
              variant: "destructive"
            });
            return;
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: "Fehler beim Laden der Chats",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    }
  }
});
