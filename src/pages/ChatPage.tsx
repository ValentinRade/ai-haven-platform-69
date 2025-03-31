
import React from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatInterface from '@/components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <div className="flex h-screen">
      <div className="w-72 border-r border-gray-200 hidden md:block">
        <ChatSidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;
