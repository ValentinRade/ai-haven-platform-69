
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ChatStore } from '../../types/chatStore.types';

export const handleAIResponse = async (
  set: Function,
  get: () => ChatStore,
  currentChatId: string,
  aiResponse: string | object,
  chatName?: string
) => {
  try {
    // Convert object response to string if needed
    const responseContent = typeof aiResponse === 'object' ? 
      JSON.stringify(aiResponse) : aiResponse;

    if (!responseContent) {
      console.error('Empty AI response received');
      toast({
        title: "Fehler",
        description: "Leere Antwort vom AI-System erhalten.",
        variant: "destructive"
      });
      set((state: ChatStore) => ({
        ...state,
        isLoading: false
      }));
      return;
    }

    const { data: aiData, error: aiError } = await supabase
      .from('messages')
      .insert({
        chat_id: currentChatId,
        content: responseContent,
        type: 'ai'
      })
      .select()
      .single();

    if (aiError) throw aiError;

    // Update the chat state with AI's response
    set((state: ChatStore) => {
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === currentChatId) {
          const newAiMessage = {
            id: aiData.id,
            type: 'ai',
            content: responseContent,
            timestamp: new Date(aiData.created_at)
          };
          
          // When updating the chat, also update its title if a chatName is provided
          return {
            ...chat,
            title: chatName || chat.title,
            lastMessage: typeof responseContent === 'string' ? 
              (responseContent.substring(0, 30) + (responseContent.length > 30 ? '...' : '')) : 
              'AI response',
            timestamp: new Date(),
            messages: [...chat.messages, newAiMessage]
          };
        }
        return chat;
      });

      const currentChat = updatedChats.find(c => c.id === currentChatId);
      const otherChats = updatedChats.filter(c => c.id !== currentChatId);
      return { 
        chats: currentChat ? [currentChat, ...otherChats] : updatedChats,
        isLoading: false // Make sure to set isLoading to false after processing the AI response
      };
    });

    // If we got a chatName, update the chat title in the database
    if (chatName) {
      const { error: updateError } = await supabase
        .from('chats')
        .update({ title: chatName })
        .eq('id', currentChatId);
        
      if (updateError) {
        console.error('Error updating chat title:', updateError);
      }
    }
  } catch (error) {
    console.error('Error handling AI response:', error);
    // Make sure to set isLoading to false even if there's an error
    set((state: ChatStore) => ({
      ...state,
      isLoading: false
    }));
    
    toast({
      title: "Fehler bei der Verarbeitung der Antwort",
      description: "Die AI-Antwort konnte nicht korrekt verarbeitet werden.",
      variant: "destructive"
    });
  }
};
