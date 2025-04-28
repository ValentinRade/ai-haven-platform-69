
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useChatStore } from '@/store/chatStore';
import { toast } from '@/hooks/use-toast';
import ChatSidebar from './ChatSidebar';
import ChatMainView from './ChatMainView';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatContainer: React.FC = () => {
  const navigate = useNavigate();
  const { loadChats, isLoading } = useChatStore();
  const [authChecked, setAuthChecked] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication in ChatContainer');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error in ChatContainer:', error);
          toast({
            title: "Fehler bei der Authentifizierung",
            description: "Bitte melden Sie sich erneut an.",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }
        
        if (!data.session) {
          console.log('No active session, redirecting to auth');
          navigate('/auth');
          return;
        }
        
        console.log('User authenticated in ChatContainer, loading chats');
        setAuthChecked(true);
        loadChats();
      } catch (err) {
        console.error('Error checking auth in ChatContainer:', err);
        toast({
          title: "Fehler",
          description: "Es ist ein Fehler bei der Authentifizierung aufgetreten.",
          variant: "destructive"
        });
      }
    };

    checkAuth();
  }, [navigate, loadChats]);

  if (!authChecked) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-screen items-center justify-center">
        <p className="text-gray-500">Authentifizierung wird überprüft...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)] w-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="w-72 border-r border-gray-200 hidden md:block flex-shrink-0">
        <ChatSidebar />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 overflow-hidden">
        <ChatMainView />
      </div>
    </div>
  );
};

export default ChatContainer;
