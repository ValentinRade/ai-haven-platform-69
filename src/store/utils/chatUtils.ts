
import { Chat, ChatMessage } from '@/types/chat';
import { Database } from '@/integrations/supabase/types';

type ChatRow = Database['public']['Tables']['chats']['Row'];

export const formatChat = (chat: Partial<ChatRow> & { messages?: any[], updated_at: string, id: string, title: string }): Chat => {
  const formattedMessages = (chat.messages || [])
    .map(formatMessage)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Get the last message content for display in chat list
  let lastMessage = '';
  if (formattedMessages.length > 0) {
    const lastMsg = formattedMessages[formattedMessages.length - 1];
    if (typeof lastMsg.content === 'string' && isAudioMessage(lastMsg.content)) {
      lastMessage = 'Sprachnachricht';
    } else {
      // Try to parse JSON content if it exists
      try {
        if (typeof lastMsg.content === 'string' && (lastMsg.content.startsWith('[{') || lastMsg.content.startsWith('{"'))) {
          const parsed = JSON.parse(lastMsg.content);
          if (Array.isArray(parsed) && parsed[0]?.output) {
            lastMessage = parsed[0].output;
          } else if (parsed.output) {
            lastMessage = parsed.output;
          } else {
            // If we can't find an output field, use the content as is
            lastMessage = typeof lastMsg.content === 'string' ? lastMsg.content : JSON.stringify(lastMsg.content);
          }
        } else {
          // Not JSON, use as is
          lastMessage = typeof lastMsg.content === 'string' ? lastMsg.content : JSON.stringify(lastMsg.content);
        }
      } catch (e) {
        // If JSON parsing fails, use the content as is
        lastMessage = typeof lastMsg.content === 'string' ? lastMsg.content : JSON.stringify(lastMsg.content);
      }
    }
  }

  return {
    id: chat.id,
    title: chat.title,
    timestamp: new Date(chat.updated_at),
    lastMessage: lastMessage,
    creator_display_name: chat.creator_display_name || '',
    is_private: chat.is_private ?? false,
    messages: formattedMessages
  };
};

export const formatMessage = (msg: any): ChatMessage => ({
  id: msg.id,
  type: msg.type as string,
  content: msg.content,
  timestamp: new Date(msg.created_at),
  duration: msg.duration
});

// Helper function to detect audio messages
export const isAudioMessage = (content: string): boolean => {
  return content.startsWith('/9j/') || 
         content.startsWith('GkXf') || 
         content.startsWith('T21v');
};
