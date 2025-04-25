import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Chat, ChatMessage } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChat: (chatId: string) => void;
  createNewChat: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  addMessageToCurrentChat: (message: Omit<ChatMessage, 'id'>) => Promise<void>;
  getCurrentChat: () => Chat | undefined;
  loadChats: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChatId: null,

  loadChats: async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        console.log('User not authenticated, skipping chat load');
        return;
      }
      
      try {
        const { data: chats, error } = await supabase
          .from('chats')
          .select(`
            id,
            title,
            updated_at,
            creator_display_name,
            is_private,
            messages:messages (
              id,
              content,
              type,
              created_at
            )
          `)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const formattedChats: Chat[] = chats.map(chat => ({
          id: chat.id,
          title: chat.title,
          timestamp: new Date(chat.updated_at),
          lastMessage: chat.messages?.[0]?.content || '',
          creator_display_name: chat.creator_display_name,
          is_private: chat.is_private || false,
          messages: (chat.messages || []).map(msg => ({
            id: msg.id,
            type: msg.type as 'user' | 'ai',
            content: msg.content,
            timestamp: new Date(msg.created_at)
          })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        }));

        set({ chats: formattedChats });
        
        if (!get().currentChatId && formattedChats.length > 0) {
          set({ currentChatId: formattedChats[0].id });
        }
      } catch (e) {
        console.error('Error with is_private, falling back:', e);
        const { data: chats, error } = await supabase
          .from('chats')
          .select(`
            id,
            title,
            updated_at,
            creator_display_name,
            messages:messages (
              id,
              content,
              type,
              created_at
            )
          `)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const formattedChats: Chat[] = chats.map(chat => ({
          id: chat.id,
          title: chat.title,
          timestamp: new Date(chat.updated_at),
          lastMessage: chat.messages?.[0]?.content || '',
          creator_display_name: chat.creator_display_name,
          is_private: false,
          messages: (chat.messages || []).map(msg => ({
            id: msg.id,
            type: msg.type as 'user' | 'ai',
            content: msg.content,
            timestamp: new Date(msg.created_at)
          })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        }));

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
  },

  setCurrentChat: (chatId) => {
    set({ currentChatId: chatId });
  },

  deleteChat: async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      set((state) => ({
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
      
      let chat;
      try {
        const { data, error } = await supabase
          .from('chats')
          .insert({
            title: 'Neuer Chat', 
            user_id: userId,
            creator_display_name: userDisplayName,
            is_private: false
          })
          .select()
          .single();

        if (error) throw error;
        chat = data;
      } catch (e) {
        if (String(e).includes('does not exist')) {
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
          chat = data;
        } else {
          throw e;
        }
      }

      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chat.id,
          content: 'Hallo! Ich bin die Immofinanz AI. Wie kann ich Ihnen heute helfen?',
          type: 'ai'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      const newChat: Chat = {
        id: chat.id,
        title: chat.title,
        lastMessage: message.content,
        timestamp: new Date(chat.created_at),
        creator_display_name: userDisplayName,
        is_private: chat.is_private || false,
        messages: [{
          id: message.id,
          type: 'ai',
          content: message.content,
          timestamp: new Date(message.created_at)
        }]
      };

      set((state) => ({
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
  },

  addMessageToCurrentChat: async (message) => {
    const { currentChatId, chats } = get();
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

      set((state) => {
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
  },

  getCurrentChat: () => {
    const { chats, currentChatId } = get();
    return chats.find(chat => chat.id === currentChatId);
  }
}));
