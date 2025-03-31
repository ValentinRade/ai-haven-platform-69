
import React from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatInterface from '@/components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-48px)]">
      <div className="w-72 hidden md:block">
        <ChatSidebar />
      </div>
      <div className="flex-1">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;
