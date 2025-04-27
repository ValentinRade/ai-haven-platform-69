
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

      // Check if this is an audio message (base64 encoded)
      const isAudioMessage = typeof message.content === 'string' && (
        message.content.startsWith('/9j/') || 
        message.content.startsWith('GkXf') || 
        message.content.startsWith('T21v')
      );
      
      // For audio messages, determine duration before saving to database
      if (isAudioMessage) {
        try {
          // First, create an audio element to determine the duration
          const audioElement = new Audio(`data:audio/webm;base64,${message.content}`);
          
          return new Promise<void>((resolve, reject) => {
            audioElement.onloadedmetadata = async () => {
              // Get the duration once metadata is loaded
              const audioDuration = audioElement.duration;
              console.log('Audio duration determined:', audioDuration);
              
              if (audioDuration && isFinite(audioDuration)) {
                try {
                  // Save user's message to database with duration
                  const { data: userData, error: userError } = await supabase
                    .from('messages')
                    .insert({
                      chat_id: currentChatId,
                      content: message.content,
                      type: message.type,
                      duration: audioDuration // Store the duration in the database
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
                          duration: audioDuration // Include duration in the state
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
                      isLoading: true // Keep loading state while waiting for response
                    };
                  });

                  try {
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
                } catch (dbError) {
                  console.error('Error saving audio message to database:', dbError);
                  reject(dbError);
                }
              } else {
                console.error('Invalid audio duration:', audioDuration);
                reject(new Error('Could not determine audio duration'));
              }
              resolve();
            };

            audioElement.onerror = (error) => {
              console.error('Error loading audio metadata:', error);
              reject(error);
              
              // Still try to save the message without duration
              handleAudioWithoutDuration();
            };

            // Set a timeout in case metadata loading takes too long
            const timeoutId = setTimeout(() => {
              console.warn('Audio metadata loading timeout, proceeding without duration');
              audioElement.onerror = null; // Remove the error handler
              handleAudioWithoutDuration();
            }, 3000); // 3 second timeout

            // Function to handle cases where we can't get the duration
            const handleAudioWithoutDuration = async () => {
              clearTimeout(timeoutId);
              
              try {
                // Save user's message to database without duration
                const { data: userData, error: userError } = await supabase
                  .from('messages')
                  .insert({
                    chat_id: currentChatId,
                    content: message.content,
                    type: message.type
                    // No duration specified
                  })
                  .select()
                  .single();

                if (userError) throw userError;

                // Continue with processing as normal
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

                // Process with webhook
                try {
                  const response = await sendMessageToWebhook(
                    session.session.user.id,
                    currentChatId,
                    message.content as string,
                    isFirstMessage,
                    true
                  );

                  const aiResponse = response.answer || response.output;
                  if (aiResponse) {
                    await handleAIResponse(set, get, currentChatId, aiResponse, response.chatname);
                  }
                } catch (error) {
                  console.error('Error sending message to webhook:', error);
                  set((state: ChatStore) => ({
                    ...state,
                    isLoading: false
                  }));
                }
                
                resolve();
              } catch (error) {
                console.error('Error saving audio without duration:', error);
                reject(error);
              }
            };

            // Start loading the audio to get metadata
            audioElement.load();
          });
        } catch (audioError) {
          console.error('Error processing audio:', audioError);
          toast({
            title: "Fehler bei der Audioverarbeitung",
            description: "Die Sprachnachricht konnte nicht korrekt verarbeitet werden.",
            variant: "destructive"
          });
          
          // Set loading to false on error
          set((state: ChatStore) => ({
            ...state,
            isLoading: false
          }));
        }
      }

      // For non-audio messages, proceed as before
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

      try {
        const response = await sendMessageToWebhook(
          session.session.user.id,
          currentChatId,
          message.content as string,
          isFirstMessage,
          false // not audio
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
