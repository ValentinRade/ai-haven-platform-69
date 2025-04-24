
import React from 'react';
import { Button } from '@/components/ui/button';

type Office365AuthProps = {
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
};

const Office365Auth: React.FC<Office365AuthProps> = ({ 
  isConnected, 
  isLoading, 
  onConnect 
}) => {
  return (
    <div className="border-t border-gray-200 pt-4 space-y-2">
      <h3 className="font-medium">Office 365 Verbindung</h3>
      <Button 
        variant="outline"
        onClick={onConnect}
        className="w-full"
        disabled={isConnected || isLoading}
      >
        {isLoading ? 'Verbinde...' : isConnected ? 'Office 365 verbunden ✓' : 'Mit Office 365 verbinden'}
      </Button>
      {isConnected && (
        <p className="text-sm text-green-600">Ihr Office 365 Konto ist erfolgreich verbunden.</p>
      )}
    </div>
  );
};

export default Office365Auth;
