
import { ChatMessage } from '@/types/chat';

export interface MessagePayload extends Omit<ChatMessage, 'id'> {
  content: string;
}

export interface WebhookResponse {
  answer?: string;
  chatname?: string;
  output?: string;
}
