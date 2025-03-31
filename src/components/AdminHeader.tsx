
import React from 'react';
import { useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const AdminHeader: React.FC = () => {
  const location = useLocation();
  
  // Get the current page title based on the route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/admin' || path === '/admin/workflow-overview') {
      return 'Workflow Übersicht';
    } else if (path === '/admin/workflow-builder') {
      return 'Workflow Builder';
    } else if (path === '/admin/user-management') {
      return 'User Management';
    }
    
    return 'Admin';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold text-xl text-gray-800">{getPageTitle()}</h1>
        
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User size={18} />
                <span>Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Einstellungen</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Abmelden</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
