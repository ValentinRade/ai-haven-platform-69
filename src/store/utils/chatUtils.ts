
import { Chat, ChatMessage } from '@/types/chat';
import { Database } from '@/integrations/supabase/types';

type ChatRow = Database['public']['Tables']['chats']['Row'];

export const formatChat = (chat: Partial<ChatRow> & { messages?: any[], updated_at: string, id: string, title: string }): Chat => {
  const formattedMessages = (chat.messages || [])
    .map(formatMessage)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Get the last message content for display in chat list
  const lastMessage = formattedMessages.length > 0
    ? formattedMessages[formattedMessages.length - 1].content
    : '';

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
