
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff } from 'lucide-react';
import { Label } from '@/components/ui/label';

type LocationPrivacyToggleProps = {
  isPrivacyModeEnabled: boolean;
  togglePrivacyMode: () => void;
  showLabel?: boolean;
  small?: boolean;
};

const LocationPrivacyToggle: React.FC<LocationPrivacyToggleProps> = ({
  isPrivacyModeEnabled,
  togglePrivacyMode,
  showLabel = false,
  small = false
}) => {
  const iconSize = small ? 'h-3 w-3' : 'h-4 w-4';
  const buttonSize = small ? 'h-6 w-6' : '';
  
  return (
    <div className="flex items-center space-x-1">
      <Button
        type="button"
        size={small ? "sm" : "icon"}
        variant={isPrivacyModeEnabled ? "default" : "ghost"}
        className={`${buttonSize} p-0 aspect-square flex items-center justify-center ${isPrivacyModeEnabled ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          togglePrivacyMode();
        }}
        title={isPrivacyModeEnabled ? "Disable Privacy Mode" : "Enable Privacy Mode"}
      >
        {isPrivacyModeEnabled ? (
          <Shield className={iconSize} />
        ) : (
          <ShieldOff className={iconSize} />
        )}
      </Button>
      
      {showLabel && (
        <Label className="text-xs whitespace-nowrap">
          Privacy
        </Label>
      )}
    </div>
  );
};

export default LocationPrivacyToggle;
