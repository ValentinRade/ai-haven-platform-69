
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useChatStore } from '@/store/chatStore';
import ChatSidebar from './ChatSidebar';
import ChatMainView from './ChatMainView';

const ChatContainer: React.FC = () => {
  const navigate = useNavigate();
  const { loadChats } = useChatStore();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/auth');
        return;
      }
      
      // Load chats only if authenticated
      loadChats();
    };

    checkAuth();
  }, [navigate, loadChats]);

  return (
    <div className="flex h-[calc(100vh-56px)] w-screen overflow-hidden">
      <div className="w-72 border-r border-gray-200 hidden md:block flex-shrink-0">
        <ChatSidebar />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatMainView />
      </div>
    </div>
  );
};

export default ChatContainer;
