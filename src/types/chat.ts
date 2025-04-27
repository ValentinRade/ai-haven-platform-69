
export type Message = {
  id: string;
  type: string;
  content: string;
  duration?: number;
  timestamp: Date;
};

export type Chat = {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messages: Message[];
};

export type ChatMessage = {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  duration?: number;
};
