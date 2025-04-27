
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useChatStore } from '@/store/chatStore';

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const { loadChats } = useChatStore();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Nicht angemeldet",
          description: "Bitte melden Sie sich an, um den Chat zu nutzen.",
          variant: "default"
        });
        navigate('/auth');
      } else {
        // If authentication is successful, try to load chats
        loadChats();
      }
    };
    checkAuth();
  }, [navigate, loadChats]);
};
