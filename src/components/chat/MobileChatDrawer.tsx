
import React from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import ChatSidebar from './ChatSidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

const MobileChatDrawer: React.FC<MobileChatDrawerProps> = ({ 
  open, 
  onOpenChange,
  children 
}) => {
  const handleChatSelect = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children}
      <DrawerContent className="h-[85vh] p-0">
        <div className="h-full overflow-hidden">
          <ChatSidebar onChatSelect={handleChatSelect} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileChatDrawer;
