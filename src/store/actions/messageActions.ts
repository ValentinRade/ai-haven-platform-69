
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ChatMessage } from '@/types/chat';
import { ChatStore } from '../types/chatStore.types';

export const createMessageActions = (set: Function, get: () => ChatStore) => ({
  addMessageToCurrentChat: async (message: Omit<ChatMessage, 'id'>) => {
    const { currentChatId, chats } = get();
    if (!currentChatId) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        console.error('User not authenticated');
        return;
      }
      
      // Check if this is the first message in the chat
      const currentChat = chats.find(chat => chat.id === currentChatId);
      const isFirstMessage = currentChat?.messages.length === 0;

      // Check if the message is an audio message by looking at the content format
      const isAudioMessage = message.content.startsWith('/9j/') || 
                           message.content.startsWith('GkXf') || 
                           message.content.startsWith('T21v');
      
      // Prepare webhook payload based on message type
      const webhookPayload = {
        userId: session.session.user.id,
        chatId: currentChatId,
        isFirstMessage: isFirstMessage,
        ...(isAudioMessage 
          ? { audio: message.content }  // Send as audio if it's a base64 audio message
          : { message: message.content } // Send as text message otherwise
        )
      };
      
      // Send message to webhook and wait for response
      let aiResponse;
      let chatName;
      try {
        const response = await fetch('https://automation-n8n.ny2xzw.easypanel.host/webhook-test/06bd3c97-5c9b-49bb-88c3-d16a5d20a52b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        });
        
        const responseData = await response.json();
        if (responseData.answer) {
          aiResponse = responseData.answer;
        }
        if (isFirstMessage && responseData.chatname) {
          chatName = responseData.chatname;
        }
      } catch (error) {
        console.error('Error sending message to webhook:', error);
        // Continue with message creation even if webhook fails
      }
      
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

      // If we got a chatName from the webhook for the first message, update the chat title
      if (chatName) {
        const { error: updateError } = await supabase
          .from('chats')
          .update({ title: chatName })
          .eq('id', currentChatId);
          
        if (updateError) {
          console.error('Error updating chat title:', updateError);
        }
      }

      // Update the chat state with user's message and potentially new title
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
              ...(chatName ? { title: chatName } : {}), // Update title if we got a new one
              lastMessage: message.content,
              timestamp: new Date(),
              messages: [...chat.messages, newMessage]
            };
          }
          return chat;
        });

        return { 
          chats: updatedChats 
        };
      });

      // If we got an AI response from the webhook, save and add it to the chat
      if (aiResponse) {
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
      }
    } catch (error) {
      console.error('Error adding message:', error);
      toast({
        title: "Fehler beim Senden der Nachricht",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    }
  }
});
