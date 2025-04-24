
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setDisplayName(session.user.user_metadata.display_name || '');
        setEmail(session.user.email || '');
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
      // Implement Office 365 OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          // You'll need to configure Azure AD in Supabase settings
          scopes: 'offline_access openid profile email',
        }
      });

      if (error) throw error;

      // When the OAuth flow completes, the token will be automatically stored
      toast({
        title: 'Office 365 verbunden',
        description: 'Ihr Office 365 Konto wurde erfolgreich verbunden.',
      });
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
          >
            Mit Office 365 verbinden
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
