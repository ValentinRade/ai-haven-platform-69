
import React from 'react';
import { useChatStore } from '@/store/chatStore';
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInputArea from './ChatInputArea';

const ChatMainView: React.FC = () => {
  const { getCurrentChat, isLoading } = useChatStore();
  const currentChat = getCurrentChat();

  return (
    <div className="flex flex-col h-screen w-full">
      <ChatHeader title={currentChat?.title || 'Neuer Chat'} />
      <ChatMessageList currentChat={currentChat} isLoading={isLoading} />
      <ChatInputArea />
    </div>
  );
};

export default ChatMainView;
