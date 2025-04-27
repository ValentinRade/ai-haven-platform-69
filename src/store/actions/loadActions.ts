
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ChatStore } from '../types/chatStore.types';
import { formatChat } from '../utils/chatUtils';

export const createLoadActions = (set: Function, get: () => ChatStore) => ({
  loadChats: async () => {
    try {
      // Check if user is authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session retrieval error:', sessionError);
        toast({
          title: "Fehler bei der Authentifizierung",
          description: "Bitte melden Sie sich erneut an.",
          variant: "destructive"
        });
        set({ isLoading: false });
        return;
      }
      
      if (!sessionData.session?.user) {
        console.log('User not authenticated, skipping chat load');
        return;
      }

      console.log('User authenticated, proceeding to load chats');
      
      // Set loading state
      set({ isLoading: true });

      try {
        console.log('Sending request to Supabase to fetch chats...');
        
        const { data, error, status } = await supabase
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

        console.log('Response status:', status);
        
        if (error) {
          console.error('Error loading chats:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          toast({
            title: "Fehler beim Laden der Chats",
            description: "Bitte versuchen Sie es später erneut.",
            variant: "destructive"
          });
          set({ isLoading: false });
          return;
        }

        console.log('Chats fetched successfully, count:', data?.length);
        
        if (data) {
          // Format the chats and update state
          const formattedChats = data.map((chat) => formatChat(chat));
          console.log('Formatted chats:', formattedChats.length);
          
          set({ 
            chats: formattedChats,
            isLoading: false 
          });
          
          // If no current chat is selected and we have chats, select the first one
          if (!get().currentChatId && formattedChats.length > 0) {
            set({ currentChatId: formattedChats[0].id });
            console.log('Selected first chat:', formattedChats[0].id);
          }
        } else {
          console.log('No chats returned from database');
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        toast({
          title: "Fehler beim Laden der Chats",
          description: "Bitte versuchen Sie es später erneut.",
          variant: "destructive"
        });
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error in loadChats:', error);
      console.error('Error type:', typeof error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast({
        title: "Fehler beim Laden der Chats",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
      set({ isLoading: false });
    }
  }
});
