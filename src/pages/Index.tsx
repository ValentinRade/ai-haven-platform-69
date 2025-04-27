
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { loadChats, chats } = useChatStore();

  useEffect(() => {
    async function checkAuthAndLoadChats() {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
          return;
        }
        
        if (data.session) {
          console.log('User session found, loading chats from Index page');
          loadChats();
        } else {
          console.log('No user session found in Index page');
        }
      } catch (error) {
        console.error('Error in Index page:', error);
        toast({
          title: "Fehler",
          description: "Es ist ein Fehler beim Laden der Daten aufgetreten.",
          variant: "destructive"
        });
      }
    }
    
    checkAuthAndLoadChats();
  }, [loadChats]);

  return <Navigate to="/" replace />;
};

export default Index;
