
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useChatStore } from '@/store/chatStore';

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const { loadChats } = useChatStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
          toast({
            title: "Authentifizierungsfehler",
            description: "Fehler beim Überprüfen der Anmeldung. Bitte erneut versuchen.",
            variant: "destructive"
          });
          setIsAuthenticated(false);
          navigate('/auth');
          return;
        }
        
        if (!session) {
          console.log('No active session found, redirecting to auth page');
          toast({
            title: "Nicht angemeldet",
            description: "Bitte melden Sie sich an, um den Chat zu nutzen.",
            variant: "default"
          });
          setIsAuthenticated(false);
          navigate('/auth');
        } else {
          console.log('User authenticated:', session.user.id);
          setIsAuthenticated(true);
          // If authentication is successful, try to load chats
          await loadChats();
        }
      } catch (err) {
        console.error('Unexpected error during auth check:', err);
        toast({
          title: "Authentifizierungsfehler",
          description: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
          variant: "destructive"
        });
        navigate('/auth');
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          await loadChats();
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          navigate('/auth');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, loadChats]);

  return { isAuthenticated };
};
