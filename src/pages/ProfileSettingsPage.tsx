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
      // Use Supabase's OAuth flow which will handle the proper authorization code flow
      // instead of trying to get a token directly
      const redirectUrl = window.location.origin + '/profile';
      console.log("Using redirect URL:", redirectUrl);
      
      // Use the signInWithOAuth method but with skipBrowserRedirect: true
      // so we can customize how we open the popup
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'offline_access openid profile email',
          redirectTo: redirectUrl,
          // This is important - it prevents creating a new session
          skipBrowserRedirect: true,
        }
      });

      if (error) throw error;
      
      // If we get here, we have the authorization URL, open it
      if (data?.url) {
        console.log("Opening Azure OAuth URL:", data.url);
        window.location.href = data.url;
      }
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

export default ProfileSettingsPage;
