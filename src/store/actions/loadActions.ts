
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

      // Add retry logic with exponential backoff
      const maxRetries = 5;
      let retries = 0;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          console.log(`Attempting to load chats (attempt ${retries + 1}/${maxRetries})...`);
          
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
                description: "Verbindungsprobleme mit der Datenbank. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es später erneut.",
                variant: "destructive"
              });
              return;
            }
            // Wait before retrying with exponential backoff
            const delay = Math.min(1000 * Math.pow(2, retries), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          if (data) {
            console.log('Successfully loaded chats:', data.length);
            // Explicitly type the data to match what formatChat expects
            const formattedChats = data.map((chat) => formatChat(chat));
            
            set({ chats: formattedChats });
            
            if (!get().currentChatId && formattedChats.length > 0) {
              set({ currentChatId: formattedChats[0].id });
            }
          }
          success = true;
        } catch (error) {
          console.error(`Network error loading chats (attempt ${retries + 1}/${maxRetries}):`, error);
          retries++;
          if (retries >= maxRetries) {
            toast({
              title: "Netzwerkfehler",
              description: "Verbindungsprobleme mit der Datenbank. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es später erneut.",
              variant: "destructive"
            });
            return;
          }
          // Wait before retrying with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retries), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      console.error('Error in loadChats function:', error);
      toast({
        title: "Fehler beim Laden der Chats",
        description: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    }
  }
});
