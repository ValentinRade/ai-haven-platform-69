
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ChatStore } from '../../types/chatStore.types';
import { WebhookResponse } from './types';

export const handleAIResponse = async (
  set: Function,
  get: () => ChatStore,
  currentChatId: string,
  aiResponse: string,
  chatName?: string
) => {
  try {
    const { data: aiData, error: aiError } = await supabase
      .from('messages')
      .insert({
        chat_id: currentChatId,
        content: aiResponse,
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
            content: aiResponse,
            timestamp: new Date(aiData.created_at)
          };
          
          return {
            ...chat,
            lastMessage: aiResponse,
            timestamp: new Date(),
            messages: [...chat.messages, newAiMessage]
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

    // If we got a chatName, update the chat title
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
    throw error;
  }
};
