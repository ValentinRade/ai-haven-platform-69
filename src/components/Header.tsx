
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { BrainCircuit, Settings } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/lovable-uploads/c347b4c9-f575-4333-aeb2-3c8013a34710.png" alt="Immofinanz Logo" className="h-8" />
        </Link>
        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
