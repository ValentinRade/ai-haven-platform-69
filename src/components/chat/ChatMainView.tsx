
import React from 'react';
import { useChatStore } from '@/store/chatStore';
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInputArea from './ChatInputArea';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Drawer, DrawerTrigger } from '@/components/ui/drawer';

const ChatMainView: React.FC = () => {
  const { getCurrentChat, isLoading } = useChatStore();
  const currentChat = getCurrentChat();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] w-full">
      <ChatHeader 
        title={currentChat?.title || 'Neuer Chat'} 
        leftElement={isMobile && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Chat Übersicht öffnen</span>
              </Button>
            </DrawerTrigger>
          </Drawer>
        )}
      />
      <ChatMessageList currentChat={currentChat} isLoading={isLoading} />
      <ChatInputArea />
    </div>
  );
};

export default ChatMainView;
