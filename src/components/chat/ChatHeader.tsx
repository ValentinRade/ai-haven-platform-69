
import React from 'react';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Settings, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ChatHeader: React.FC = () => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-3 h-14 flex items-center justify-between w-full">
      <div className="flex-1">
        <h1 className="text-xl font-medium truncate max-w-[80%]">
          {/* Will be passed via props in next iteration */}
          Neuer Chat
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="rounded-full border-gray-200">
          <div className="flex items-center gap-2">
            <BrainCircuit size={16} className="text-gray-600" />
            <span>AI Chat</span>
          </div>
        </Button>
        <Button variant="outline" size="sm" className="rounded-full border-gray-200">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-gray-600" />
            <span>Admin</span>
          </div>
        </Button>
        <Avatar className="h-9 w-9 border border-gray-200">
          <AvatarImage src="" />
          <AvatarFallback>
            <UserRound size={20} />
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default ChatHeader;
