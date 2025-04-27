
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

      // Set loading state
      set((state: ChatStore) => ({
        ...state,
        isLoading: true
      }));

      // Check if this is an audio message
      const isAudioMessage = typeof message.content === 'string' && (
        message.content.startsWith('/9j/') || 
        message.content.startsWith('GkXf') || 
        message.content.startsWith('T21v')
      );
      
      // For audio messages, determine duration before saving
      if (isAudioMessage) {
        try {
          // Create an audio element to determine duration
          const audioElement = new Audio(`data:audio/webm;base64,${message.content}`);
          
          return new Promise<void>((resolve, reject) => {
            audioElement.onloadedmetadata = async () => {
              // Get duration once metadata is loaded
              const audioDuration = audioElement.duration;
              
              if (audioDuration && isFinite(audioDuration)) {
                try {
                  // Save user's audio message with duration
                  const { data: userData, error: userError } = await supabase
                    .from('messages')
                    .insert({
                      chat_id: currentChatId,
                      content: message.content,
                      type: message.type,
                      duration: audioDuration
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
                          timestamp: new Date(userData.created_at),
                          duration: audioDuration
                        };
                        
                        return {
                          ...chat,
                          lastMessage: "Voice message",
                          timestamp: new Date(),
                          messages: [...chat.messages, newMessage]
                        };
                      }
                      return chat;
                    });

                    return { 
                      chats: updatedChats,
                      isLoading: true
                    };
                  });

                  try {
                    // Send to webhook and process response
                    const response = await sendMessageToWebhook(
                      session.session.user.id,
                      currentChatId,
                      message.content as string,
                      isFirstMessage,
                      true // isAudio
                    );

                    const aiResponse = response.answer || response.output;
                    if (aiResponse) {
                      await handleAIResponse(set, get, currentChatId, aiResponse, response.chatname);
                    } else {
                      // Reset loading state if no response
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
                    set((state: ChatStore) => ({
                      ...state,
                      isLoading: false
                    }));
                  }
                } catch (dbError) {
                  console.error('Error saving audio message to database:', dbError);
                  reject(dbError);
                  set((state: ChatStore) => ({
                    ...state,
                    isLoading: false
                  }));
                }
              } else {
                console.error('Invalid audio duration:', audioDuration);
                reject(new Error('Could not determine audio duration'));
                set((state: ChatStore) => ({
                  ...state,
                  isLoading: false
                }));
              }
              resolve();
            };

            audioElement.onerror = (error) => {
              console.error('Error loading audio metadata:', error);
              reject(error);
              set((state: ChatStore) => ({
                ...state,
                isLoading: false
              }));
            };

            // Set timeout in case metadata loading takes too long
            setTimeout(() => {
              console.warn('Audio metadata loading timed out');
              audioElement.onerror = null;
              set((state: ChatStore) => ({
                ...state,
                isLoading: false
              }));
            }, 5000);

            // Start loading audio
            audioElement.load();
          });
        } catch (audioError) {
          console.error('Error processing audio:', audioError);
          toast({
            title: "Fehler bei der Audioverarbeitung",
            description: "Die Sprachnachricht konnte nicht korrekt verarbeitet werden.",
            variant: "destructive"
          });
          
          set((state: ChatStore) => ({
            ...state,
            isLoading: false
          }));
        }
      }

      // For text messages
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
                ? message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '')
                : 'User message',
              timestamp: new Date(),
              messages: [...chat.messages, newMessage]
            };
          }
          return chat;
        });

        return { 
          chats: updatedChats,
          isLoading: true
        };
      });

      try {
        // Send message to webhook and process response
        const response = await sendMessageToWebhook(
          session.session.user.id,
          currentChatId,
          message.content as string,
          isFirstMessage,
          false
        );

        const aiResponse = response.answer || response.output;
        if (aiResponse) {
          await handleAIResponse(set, get, currentChatId, aiResponse, response.chatname);
        } else {
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
      set((state: ChatStore) => ({
        ...state,
        isLoading: false
      }));
    }
  }
});
