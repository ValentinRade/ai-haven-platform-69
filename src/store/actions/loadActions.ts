
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

      console.log('Starting to load chats for user:', session.session.user.id);
      
      try {
        // Direct approach without retries first
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
          .eq('user_id', session.session.user.id)
          .order('updated_at', { ascending: false });

        // Log the raw response for debugging
        console.log('Raw Supabase response:', { data, error });
        
        if (error) {
          console.error('Error loading chats:', error);
          
          // Show specific error information to the user
          if (error.code === 'PGRST116') {
            toast({
              title: "Keine Berechtigung",
              description: "Sie haben keine Berechtigung, diese Daten zu sehen. Bitte melden Sie sich erneut an.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Fehler beim Laden der Chats",
              description: `${error.message || "Bitte versuchen Sie es später erneut."}`,
              variant: "destructive"
            });
          }
          return;
        }
        
        console.log('Successfully loaded chats:', data ? data.length : 'No data returned');
        
        if (data && data.length > 0) {
          // Format the chats
          const formattedChats = data.map((chat) => formatChat(chat));
          
          console.log('Formatted chats:', formattedChats.length);
          
          set({ chats: formattedChats });
          
          if (!get().currentChatId && formattedChats.length > 0) {
            console.log('Setting current chat ID to:', formattedChats[0].id);
            set({ currentChatId: formattedChats[0].id });
          }
        } else {
          console.log('No chats found for user, empty array returned');
          set({ chats: [] });
        }
      } catch (error) {
        console.error('Network error loading chats:', error);
        toast({
          title: "Netzwerkfehler",
          description: "Verbindungsprobleme mit der Datenbank. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es später erneut.",
          variant: "destructive"
        });
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
