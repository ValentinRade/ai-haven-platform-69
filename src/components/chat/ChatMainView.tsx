
import React, { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInputArea from './ChatInputArea';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import MobileChatDrawer from './MobileChatDrawer';

const ChatMainView: React.FC = () => {
  const { getCurrentChat, isLoading } = useChatStore();
  const currentChat = getCurrentChat();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] w-full">
      <ChatHeader 
        title={currentChat?.title || 'Neuer Chat'} 
        leftElement={isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Chat Übersicht öffnen</span>
          </Button>
        )}
      />
      <ChatMessageList currentChat={currentChat} isLoading={isLoading} />
      <ChatInputArea />
      
      {isMobile && (
        <MobileChatDrawer 
          open={drawerOpen} 
          onOpenChange={setDrawerOpen} 
        >
          <div className="sr-only">Drawer Trigger (controlled programmatically)</div>
        </MobileChatDrawer>
      )}
    </div>
  );
};

export default ChatMainView;
