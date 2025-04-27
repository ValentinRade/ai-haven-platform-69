
export type ChatMessage = {
  id: string;
  type: string;
  content: string | any;
  timestamp: Date;
  duration?: number;
};

export type Chat = {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messages: ChatMessage[];
  creator_display_name?: string;
  is_private: boolean;
};
