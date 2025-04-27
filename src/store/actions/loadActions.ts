
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

      try {
        console.log('Loading chats for user:', session.session.user.id);
        const { data, error } = await supabase
          .from('chats')
          .select(`
            id,
            title,
            updated_at,
            user_id,
            creator_display_name,
            is_private,
            messages (
              id,
              content,
              type,
              created_at,
              duration
            )
          `)
          .eq('user_id', session.session.user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error loading chats:', error);
          toast({
            title: "Fehler beim Laden der Chats",
            description: "Bitte versuchen Sie es später erneut.",
            variant: "destructive"
          });
          return;
        }

        console.log('Loaded chats:', data);
        
        if (data) {
          const formattedChats = data.map((chat) => formatChat(chat));
          console.log('Formatted chats:', formattedChats);
          
          set({ chats: formattedChats });
          
          if (!get().currentChatId && formattedChats.length > 0) {
            set({ currentChatId: formattedChats[0].id });
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
    } catch (error) {
      console.error('Error in session check:', error);
      toast({
        title: "Fehler beim Laden der Chats",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    }
  }
});
