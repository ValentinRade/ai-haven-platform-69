
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { BrainCircuit, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { UserRound } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-1 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/lovable-uploads/70e3d10a-20be-4809-8385-3ffda9ff9893.png" alt="Immofinanz Logo" className="h-12" />
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-secondary" asChild>
            <Link to="/" className="flex items-center gap-2">
              <BrainCircuit size={18} />
              <span>AI Chat</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-secondary" asChild>
            <Link to="/admin" className="flex items-center gap-2">
              <Settings size={18} />
              <span>Admin</span>
            </Link>
          </Button>
          <Avatar className="h-9 w-9 border border-gray-200">
            <AvatarImage src="" />
            <AvatarFallback>
              <UserRound size={20} />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
