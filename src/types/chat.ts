
export type Chat = {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messages: Message[];
  creator_display_name?: string;
  is_private: boolean; // Update to make this required
};
