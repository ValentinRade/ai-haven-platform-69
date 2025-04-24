
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const ProfileSettingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenSaved, setIsTokenSaved] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle Office 365 OAuth redirect
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      if (window.location.hash) {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1) // remove the # character
        );
        
        const providerToken = hashParams.get('provider_token');
        
        if (providerToken && user) {
          setIsLoading(true);
          try {
            // Store the token in the profiles table
            const { error } = await supabase
              .from('profiles')
              .update({ office365_token: providerToken })
              .eq('id', user.id);

            if (error) throw error;

            setIsTokenSaved(true);
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
      }
    };

    if (user) {
      handleOAuthRedirect();
    }
  }, [user, toast]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setDisplayName(session.user.user_metadata.display_name || '');
        setEmail(session.user.email || '');
        
        // Check if token is already saved
        const { data } = await supabase
          .from('profiles')
          .select('office365_token')
          .eq('id', session.user.id)
          .single();
          
        if (data?.office365_token) {
          setIsTokenSaved(true);
        }
      } else {
        navigate('/auth');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;

      // Update profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: 'Profil aktualisiert',
        description: 'Ihr Profilname wurde erfolgreich geändert.',
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

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;

      toast({
        title: 'Passwort zurücksetzen',
        description: 'Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet.',
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleConnectOffice365 = async () => {
    try {
      // Instead of using Supabase auth flow, we'll directly open the Microsoft login page
      // with the correct client ID and redirect URL
      const redirectUrl = window.location.origin + '/profile';
      
      // Get the Azure client ID from Supabase OAuth settings
      // This will use the existing OAuth configuration but without creating a new user
      const baseUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
      
      // You need to get your client ID from the Supabase dashboard under Auth > Providers > Microsoft/Azure
      // This is just a placeholder - the real client ID would come from your Supabase config
      // We're using a special URL that will redirect back with the token but won't create a new session
      
      // Construct the OAuth URL manually - request for offline_access to get refresh token
      const authUrl = `${baseUrl}?client_id=${AZURE_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=offline_access%20openid%20profile%20email&response_mode=fragment`;
      
      console.log("Opening Azure OAuth URL:", authUrl);
      
      // Open the authorization URL in the same window
      window.location.href = authUrl;
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Profileinstellungen</h1>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Anzeigename</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ihr Anzeigename"
          />
        </div>

        <Button 
          onClick={handleUpdateProfile} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Wird aktualisiert...' : 'Profil aktualisieren'}
        </Button>

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <Label>Passwort</Label>
          <Button 
            variant="outline" 
            onClick={handleResetPassword} 
            className="w-full"
          >
            Passwort zurücksetzen
          </Button>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <Label>Office 365 Verbindung</Label>
          <Button 
            variant="outline"
            onClick={handleConnectOffice365}
            className="w-full"
            disabled={isTokenSaved}
          >
            {isTokenSaved ? 'Office 365 verbunden ✓' : 'Mit Office 365 verbinden'}
          </Button>
          {isTokenSaved && (
            <p className="text-sm text-green-600">Ihr Office 365 Konto ist bereits verbunden.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Replace this with your actual Azure client ID from Supabase dashboard
const AZURE_CLIENT_ID = "7a666ed4-fb0e-4d83-b1aa-8e8750d69141";

export default ProfileSettingsPage;
