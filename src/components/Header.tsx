
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, LogIn, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Switch } from './ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const isProfile = location.pathname.startsWith('/profile');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handlePrivacyToggle = (checked: boolean) => {
    setIsPrivate(checked);
    // Here you can implement the logic to update the chat privacy status
    // For example, make an API call to update the chat's privacy setting
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-1 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/lovable-uploads/70e3d10a-20be-4809-8385-3ffda9ff9893.png" alt="Immofinanz Logo" className="h-8" />
        </Link>
        <div className="flex items-center gap-4">
          {isAdmin || isProfile ? (
            <Button variant="outline" size="sm" className="text-secondary" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft size={18} />
                <span>Back to Chat</span>
              </Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Privat</span>
              <Switch
                checked={isPrivate}
                onCheckedChange={handlePrivacyToggle}
              />
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <UserRound size={18} />
                    <span>Profil</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate('/profile')}>
                    Profileinstellungen
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleLogout}>
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn size={18} />
                <span>Anmelden</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
