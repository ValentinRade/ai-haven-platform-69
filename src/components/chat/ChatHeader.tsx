
import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  leftElement?: React.ReactNode;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, leftElement }) => {
  return (
    <div className="flex items-center border-b border-gray-200 px-4 py-3 h-[60px] bg-white">
      {leftElement}
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-medium text-gray-800 truncate max-w-xs">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default ChatHeader;
