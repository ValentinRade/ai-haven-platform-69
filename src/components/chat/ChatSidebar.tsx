
import React from 'react';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChatSidebar: React.FC = () => {
  const { chats, currentChatId, setCurrentChat, createNewChat } = useChatStore();

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <div className="mb-4">
          <img 
            src="/lovable-uploads/c347b4c9-f575-4333-aeb2-3c8013a34710.png" 
            alt="Immofinanz Logo" 
            className="h-12 mx-auto" 
          />
        </div>
        <Button 
          onClick={createNewChat}
          className="w-full gap-2 bg-immo-green hover:bg-immo-green/90"
        >
          <PlusCircle size={16} />
          <span>Neuer Chat</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setCurrentChat(chat.id)}
                className={cn(
                  "flex flex-col w-full text-left rounded-lg px-3 py-3 transition-colors",
                  "hover:bg-gray-200",
                  currentChatId === chat.id 
                    ? "bg-gray-200" 
                    : "bg-white"
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare size={16} className="flex-shrink-0 text-gray-500" />
                  <span className="font-medium truncate">{chat.title}</span>
                </div>
                <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                  <span className="truncate max-w-[180px]">{chat.lastMessage}</span>
                  <span className="flex-shrink-0">
                    {format(chat.timestamp, 'dd. MMM', { locale: de })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-200">
        <Button 
          variant="outline" 
          size="sm"
          asChild
          className="w-full gap-2 text-xs"
        >
          <a href="/admin/workflow-overview">
            Admin-Bereich
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;
