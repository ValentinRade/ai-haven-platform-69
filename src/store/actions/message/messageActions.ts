
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ChatStore } from '../../types/chatStore.types';
import { MessagePayload } from './types';
import { handleAIResponse } from './handleAIResponse';
import { sendMessageToWebhook } from './webhookService';

export const createMessageActions = (set: Function, get: () => ChatStore) => ({
  addMessageToCurrentChat: async (message: MessagePayload) => {
    const { currentChatId, chats } = get();
    if (!currentChatId) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        console.error('User not authenticated');
        return;
      }
      
      const currentChat = chats.find(chat => chat.id === currentChatId);
      const isFirstMessage = currentChat?.messages.length === 0;

      // Set loading state to true before sending message
      set((state: ChatStore) => ({
        ...state,
        isLoading: true
      }));

      // Save user's message to database
      const { data: userData, error: userError } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChatId,
          content: message.content,
          type: message.type
        })
        .select()
        .single();

      if (userError) throw userError;

      // Update chat state with user's message
      set((state: ChatStore) => {
        const updatedChats = state.chats.map((chat) => {
          if (chat.id === currentChatId) {
            const newMessage = {
              id: userData.id,
              type: message.type,
              content: message.content,
              timestamp: new Date(userData.created_at)
            };
            
            return {
              ...chat,
              lastMessage: typeof message.content === 'string' 
                ? message.content 
                : 'User message',
              timestamp: new Date(),
              messages: [...chat.messages, newMessage]
            };
          }
          return chat;
        });

        return { 
          chats: updatedChats,
          isLoading: true // Keep loading state while waiting for response
        };
      });

      // Check if it's an audio message
      const isAudioMessage = typeof message.content === 'string' && (
        message.content.startsWith('/9j/') || 
        message.content.startsWith('GkXf') || 
        message.content.startsWith('T21v')
      );
      
      try {
        const response = await sendMessageToWebhook(
          session.session.user.id,
          currentChatId,
          message.content as string,
          isFirstMessage,
          isAudioMessage
        );

        const aiResponse = response.answer || response.output;
        if (aiResponse) {
          await handleAIResponse(set, get, currentChatId, aiResponse, response.chatname);
        } else {
          // If no response, still set loading to false
          set((state: ChatStore) => ({
            ...state,
            isLoading: false
          }));
        }
      } catch (error) {
        console.error('Error sending message to webhook:', error);
        toast({
          title: "Fehler bei der Verarbeitung",
          description: "Die Nachricht konnte nicht verarbeitet werden.",
          variant: "destructive"
        });
        // Always set loading to false when done
        set((state: ChatStore) => ({
          ...state,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error adding message:', error);
      toast({
        title: "Fehler beim Senden der Nachricht",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
      // Set loading to false on error as well
      set((state: ChatStore) => ({
        ...state,
        isLoading: false
      }));
    }
  }
});
