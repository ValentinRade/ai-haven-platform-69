
import React from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/d3c3c26f-df32-4d33-9430-cf975050325f.png" 
            alt="Immofinanz Logo" 
            className="h-8"
          />
        </Link>
        <div className="flex items-center space-x-4">
          <div className="text-xs md:text-sm font-medium bg-gray-50 text-primary px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
            TikTok Immobilien
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
