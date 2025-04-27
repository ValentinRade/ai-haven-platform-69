
import { Chat, ChatMessage } from '@/types/chat';
import { Database } from '@/integrations/supabase/types';

type ChatRow = Database['public']['Tables']['chats']['Row'];

// Update the formatChat function to be more flexible with the input type
export const formatChat = (chat: Partial<ChatRow> & { messages?: any[], updated_at: string, id: string, title: string }): Chat => ({
  id: chat.id,
  title: chat.title,
  timestamp: new Date(chat.updated_at),
  lastMessage: chat.messages?.[0]?.content || '',
  creator_display_name: chat.creator_display_name || '',
  is_private: chat.is_private || false, // Provide default value for is_private if it doesn't exist
  messages: (chat.messages || []).map(formatMessage)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
});

export const formatMessage = (msg: any): ChatMessage => ({
  id: msg.id,
  type: msg.type as 'user' | 'ai',
  content: msg.content,
  timestamp: new Date(msg.created_at)
});
