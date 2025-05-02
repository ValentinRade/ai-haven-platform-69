
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

type FinCRMAuthProps = {
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  email?: string | null;
};

const FinCRMAuth: React.FC<FinCRMAuthProps> = ({ 
  isConnected, 
  isLoading, 
  onConnect,
  onDisconnect,
  email
}) => {
  return (
    <div className="border-t border-gray-200 pt-4 space-y-2">
      <h3 className="font-medium">FinCRM Verbindung</h3>
      {isConnected ? (
        <div className="space-y-4">
          <p className="text-sm text-green-600">
            {email 
              ? `Ihr FinCRM Konto ${email} ist erfolgreich verbunden.` 
              : 'Ihr FinCRM Konto ist erfolgreich verbunden.'}
          </p>
          <Button 
            variant="destructive"
            onClick={onDisconnect}
            className="w-full"
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            FinCRM Verbindung trennen
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline"
          onClick={onConnect}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Verbinde...' : 'Mit FinCRM verbinden'}
        </Button>
      )}
    </div>
  );
};

export default FinCRMAuth;
