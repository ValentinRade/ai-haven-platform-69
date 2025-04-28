
import React from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import ChatSidebar from './ChatSidebar';

const MobileChatDrawer: React.FC = () => {
  return (
    <Drawer>
      <DrawerContent className="h-[85vh] p-0">
        <div className="h-full overflow-hidden">
          <ChatSidebar />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileChatDrawer;
