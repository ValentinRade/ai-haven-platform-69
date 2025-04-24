
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Components
import ProfileForm from '@/components/ProfileForm';
import PasswordReset from '@/components/PasswordReset';
import Office365Auth from '@/components/Office365Auth';

// Hooks
import { useOffice365Auth } from '@/hooks/useOffice365Auth';

const ProfileSettingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  
  // Office 365 auth logic
  const { isConnected, isLoading, connectToOffice365 } = useOffice365Auth(user);

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

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Profileinstellungen</h1>
      
      <div className="space-y-6">
        {/* Profile Form Component */}
        <ProfileForm 
          user={user} 
          displayName={displayName} 
          onUpdate={setDisplayName} 
        />
        
        {/* Password Reset Component */}
        <PasswordReset email={email} />
        
        {/* Office365 Auth Component */}
        <Office365Auth 
          isConnected={isConnected}
          isLoading={isLoading}
          onConnect={connectToOffice365}
        />
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
