
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

type ProfileFormProps = {
  user: User;
  displayName: string;
  onUpdate: (newDisplayName: string) => void;
};

const ProfileForm: React.FC<ProfileFormProps> = ({ 
  user, 
  displayName: initialDisplayName, 
  onUpdate 
}) => {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateProfile = async () => {
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

      onUpdate(displayName);
      
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

  return (
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
    </div>
  );
};

export default ProfileForm;
