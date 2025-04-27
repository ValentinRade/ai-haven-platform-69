export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string | any;
  timestamp: Date;
  duration?: number;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
  creator_display_name?: string;
  is_private: boolean;
}
