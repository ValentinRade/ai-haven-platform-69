
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useOffice365Auth = (user: User | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [office365Email, setOffice365Email] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if token is already saved
  useEffect(() => {
    const checkConnection = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('office365_token, office365_email')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) throw error;

        if (data?.office365_token) {
          setIsConnected(true);
          setOffice365Email(data.office365_email);
          console.log('Office 365 connection found:', { email: data.office365_email });
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
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const errorParam = urlParams.get('error');
      
      if (errorParam) {
        const errorDescription = urlParams.get('error_description');
        setIsLoading(false);
        toast({
          title: 'Microsoft Login fehlgeschlagen',
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
          const { data: tokenData, error: tokenError } = await supabase.functions.invoke('office365-token', {
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
              office365_token: tokenData.access_token,
              office365_email: tokenData.email 
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Database update error:', updateError);
            throw updateError;
          }

          setIsConnected(true);
          setOffice365Email(tokenData.email);
          toast({
            title: 'Office 365 verbunden',
            description: tokenData.email 
              ? `Ihr Office 365 Konto ${tokenData.email} wurde erfolgreich verbunden.`
              : 'Ihr Office 365 Konto wurde erfolgreich verbunden.',
          });
          
          // Clean up the URL
          window.history.replaceState({}, document.title, '/profile');
        } catch (error: any) {
          console.error('Office 365 connection error:', error);
          toast({
            title: 'Fehler',
            description: error.message || 'Verbindung zu Office 365 fehlgeschlagen',
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

  const connectToOffice365 = async () => {
    try {
      setIsLoading(true);
      
      // Client ID from Azure AD App registration
      const clientId = '7a666ed4-fb0e-4d83-b1aa-8e8750d69141';
      
      // Dynamically get the current site URL
      const redirectUri = encodeURIComponent(`${window.location.origin}/profile`);
      
      // Required permissions - More specific than before
      const scope = encodeURIComponent('offline_access openid profile email User.Read');
      
      // Build the OAuth URL with response_type=code for Authorization Code flow
      const oauthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&response_mode=query`;
      
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

  const disconnectFromOffice365 = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          office365_token: null,
          office365_email: null 
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsConnected(false);
      setOffice365Email(null);
      toast({
        title: 'Office 365 getrennt',
        description: 'Die Verbindung zu Ihrem Office 365 Konto wurde erfolgreich getrennt.',
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
    connectToOffice365, 
    disconnectFromOffice365,
    email: office365Email 
  };
};
