
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useFinCRMAuth = (user: User | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [finCRMEmail, setFinCRMEmail] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if token is already saved
  useEffect(() => {
    const checkConnection = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('fincrm_token, fincrm_email')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) throw error;

        if (data?.fincrm_token) {
          setIsConnected(true);
          setFinCRMEmail(data.fincrm_email);
          console.log('FinCRM connection found:', { email: data.fincrm_email });
        }
      } catch (error) {
        console.error("Error checking FinCRM connection:", error);
      }
    };

    checkConnection();
  }, [user]);

  // Handle OAuth redirect
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const errorParam = urlParams.get('error');
      
      if (errorParam) {
        const errorDescription = urlParams.get('error_description');
        setIsLoading(false);
        toast({
          title: 'FinCRM Login fehlgeschlagen',
          description: errorDescription || 'Authentifizierung fehlgeschlagen.',
          variant: 'destructive',
        });
        window.history.replaceState({}, document.title, '/profile');
        return;
      }
      
      if (code && user) {
        console.log('OAuth code detected, starting token exchange');
        setIsLoading(true);
        try {
          // Exchange code for token using our Edge Function
          const { data: tokenData, error: tokenError } = await supabase.functions.invoke('fincrm-token', {
            body: { code }
          });

          if (tokenError) {
            console.error('Token exchange error:', tokenError);
            throw new Error(tokenError.message || 'Token exchange failed');
          }

          if (!tokenData || !tokenData.access_token) {
            console.error('Invalid token data received:', tokenData);
            throw new Error('Keine gültigen Token erhalten');
          }

          console.log('Token exchange successful, email received:', tokenData.email);

          // Store the access token and email in the database
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              fincrm_token: tokenData.access_token,
              fincrm_email: tokenData.email 
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Database update error:', updateError);
            throw updateError;
          }

          setIsConnected(true);
          setFinCRMEmail(tokenData.email);
          toast({
            title: 'FinCRM verbunden',
            description: tokenData.email 
              ? `Ihr FinCRM Konto ${tokenData.email} wurde erfolgreich verbunden.`
              : 'Ihr FinCRM Konto wurde erfolgreich verbunden.',
          });
          
          // Clean up the URL
          window.history.replaceState({}, document.title, '/profile');
        } catch (error: any) {
          console.error('FinCRM connection error:', error);
          toast({
            title: 'Fehler',
            description: error.message || 'Verbindung zu FinCRM fehlgeschlagen',
            variant: 'destructive',
          });
          // Clean up the URL even on error
          window.history.replaceState({}, document.title, '/profile');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      handleOAuthRedirect();
    }
  }, [user, toast]);

  const connectToFinCRM = async () => {
    try {
      setIsLoading(true);
      
      // Client ID from FinCRM App registration
      const clientId = '54321-fincrm-client-id-12345';
      
      // Dynamically get the current site URL
      const redirectUri = encodeURIComponent(`${window.location.origin}/profile`);
      
      // Required permissions
      const scope = encodeURIComponent('offline_access openid profile email user.read');
      
      // Build the OAuth URL with response_type=code for Authorization Code flow
      const oauthUrl = `https://api.fincrm.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&response_mode=query`;
      
      console.log("Redirecting to OAuth URL:", oauthUrl);
      
      // Redirect user to the OAuth page
      window.location.href = oauthUrl;
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const disconnectFromFinCRM = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          fincrm_token: null,
          fincrm_email: null 
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsConnected(false);
      setFinCRMEmail(null);
      toast({
        title: 'FinCRM getrennt',
        description: 'Die Verbindung zu Ihrem FinCRM Konto wurde erfolgreich getrennt.',
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    isConnected, 
    isLoading, 
    connectToFinCRM, 
    disconnectFromFinCRM,
    email: finCRMEmail 
  };
};
