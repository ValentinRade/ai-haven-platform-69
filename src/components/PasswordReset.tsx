
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type PasswordResetProps = {
  email: string;
};

const PasswordReset: React.FC<PasswordResetProps> = ({ email }) => {
  const { toast } = useToast();

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

  return (
    <div className="border-t border-gray-200 pt-4 space-y-2">
      <h3 className="font-medium">Passwort</h3>
      <Button 
        variant="outline" 
        onClick={handleResetPassword} 
        className="w-full"
      >
        Passwort zurücksetzen
      </Button>
    </div>
  );
};

export default PasswordReset;
