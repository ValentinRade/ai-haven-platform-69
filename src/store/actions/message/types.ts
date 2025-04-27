
import { ChatMessage } from '@/types/chat';

export interface MessagePayload extends Omit<ChatMessage, 'id'> {
  content: string | any;  // Allow for object content
}

export interface WebhookResponse {
  answer?: string | any;
  chatname?: string;
  output?: string | any;
}
