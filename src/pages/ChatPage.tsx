
import React from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatInterface from '@/components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-56px)] w-screen overflow-hidden">
      <div className="w-72 border-r border-gray-200 hidden md:block flex-shrink-0">
        <ChatSidebar />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;
