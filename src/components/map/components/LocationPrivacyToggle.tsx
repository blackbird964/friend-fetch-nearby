
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type LocationPrivacyToggleProps = {
  isPrivacyModeEnabled: boolean;
  togglePrivacyMode: () => void;
  showLabel?: boolean;
  small?: boolean;
  variant?: 'button' | 'switch';
};

const LocationPrivacyToggle: React.FC<LocationPrivacyToggleProps> = ({
  isPrivacyModeEnabled,
  togglePrivacyMode,
  showLabel = false,
  small = false,
  variant = 'button'
}) => {
  const iconSize = small ? 'h-3 w-3' : 'h-4 w-4';
  const buttonSize = small ? 'h-6 w-6' : '';
  
  return (
    <div className={cn(
      "flex items-center gap-1",
      variant === 'switch' ? 'flex-row' : 'flex-col'
    )}>
      {variant === 'button' ? (
        <Button
          type="button"
          size={small ? "sm" : "icon"}
          variant={isPrivacyModeEnabled ? "default" : "ghost"}
          className={cn(
            `${buttonSize} p-0 aspect-square flex items-center justify-center transition-all duration-300`,
            isPrivacyModeEnabled 
              ? 'bg-purple-500 hover:bg-purple-600 shadow-md shadow-purple-200' 
              : 'hover:bg-gray-100'
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePrivacyMode();
          }}
          title={isPrivacyModeEnabled ? "Disable Privacy Mode" : "Enable Privacy Mode"}
        >
          <div className="relative">
            {isPrivacyModeEnabled ? (
              <Shield className={cn(iconSize, "text-white animate-pulse")} />
            ) : (
              <ShieldOff className={cn(iconSize, "text-gray-500")} />
            )}
            {isPrivacyModeEnabled && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full ring-1 ring-white"></span>
            )}
          </div>
        </Button>
      ) : (
        <div className="flex items-center">
          <Switch
            id="privacy-mode"
            checked={isPrivacyModeEnabled}
            onCheckedChange={togglePrivacyMode}
            className={cn(
              "data-[state=checked]:bg-purple-500",
              small ? "scale-75" : ""
            )}
          />
          {isPrivacyModeEnabled && (
            <Shield className={cn("text-purple-500 ml-1", iconSize, "animate-pulse transition-opacity")} />
          )}
          {!isPrivacyModeEnabled && (
            <ShieldOff className={cn("text-gray-400 ml-1", iconSize, "transition-opacity")} />
          )}
        </div>
      )}
      
      {showLabel && (
        <Label 
          className={cn(
            "text-xs whitespace-nowrap", 
            isPrivacyModeEnabled ? "text-purple-700 font-medium" : "text-gray-500",
            variant === 'button' ? "mt-1 text-center" : ""
          )}
        >
          Privacy {isPrivacyModeEnabled && small && variant !== 'button' ? "On" : ""}
        </Label>
      )}
    </div>
  );
};

export default LocationPrivacyToggle;
