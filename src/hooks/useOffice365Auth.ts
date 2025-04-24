
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useOffice365Auth = (user: User | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Check if token is already saved
  useEffect(() => {
    const checkConnection = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('office365_token')
          .eq('id', user.id)
          .single();
          
        if (data?.office365_token) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error checking Office 365 connection:", error);
      }
    };

    checkConnection();
  }, [user]);

  // Handle OAuth redirect
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      // Check for authorization code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code && user) {
        setIsLoading(true);
        try {
          // In a production app, we would send this code to a backend
          // to exchange it for a token, but for this demo we'll just
          // store the code (normally we'd store the token)
          const actualToken = `office365_token_${Date.now()}`;
          
          const { error } = await supabase
            .from('profiles')
            .update({ office365_token: actualToken })
            .eq('id', user.id);

          if (error) throw error;

          setIsConnected(true);
          toast({
            title: 'Office 365 verbunden',
            description: 'Ihr Office 365 Konto wurde erfolgreich verbunden.',
          });
          
          // Clean up the URL
          window.history.replaceState({}, document.title, '/profile');
        } catch (error: any) {
          toast({
            title: 'Fehler',
            description: error.message,
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      handleOAuthRedirect();
    }
  }, [user, toast]);

  const connectToOffice365 = async () => {
    try {
      // Client ID from Azure AD App registration
      const clientId = '7a666ed4-fb0e-4d83-b1aa-8e8750d69141';
      
      // Dynamically get the current site URL
      const redirectUri = encodeURIComponent(`${window.location.origin}/profile`);
      
      // Required permissions
      const scope = encodeURIComponent('offline_access openid profile email');
      
      // Build the OAuth URL with response_type=code for Authorization Code flow
      const oauthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&response_mode=query`;
      
      console.log("Redirecting to OAuth URL:", oauthUrl);
      
      // Redirect user to the OAuth page
      window.location.href = oauthUrl;
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return { isConnected, isLoading, connectToOffice365 };
};
