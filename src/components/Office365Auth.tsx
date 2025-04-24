
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

type Office365AuthProps = {
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
};

const Office365Auth: React.FC<Office365AuthProps> = ({ 
  isConnected, 
  isLoading, 
  onConnect,
  onDisconnect
}) => {
  return (
    <div className="border-t border-gray-200 pt-4 space-y-2">
      <h3 className="font-medium">Office 365 Verbindung</h3>
      {isConnected ? (
        <div className="space-y-4">
          <p className="text-sm text-green-600">Ihr Office 365 Konto ist erfolgreich verbunden.</p>
          <Button 
            variant="destructive"
            onClick={onDisconnect}
            className="w-full"
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Office 365 Verbindung trennen
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline"
          onClick={onConnect}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Verbinde...' : 'Mit Office 365 verbinden'}
        </Button>
      )}
    </div>
  );
};

export default Office365Auth;
