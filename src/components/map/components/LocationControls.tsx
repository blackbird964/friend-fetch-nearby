
import React from 'react';
import { MapPin, Locate, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import LocationPrivacyToggle from './LocationPrivacyToggle';

type LocationControlsProps = {
  getUserLocation: () => void;
  isLocating: boolean;
  toggleLocationTracking: () => void;
  isTracking: boolean;
  isManualMode: boolean;
  toggleManualMode: () => void;
  isPrivacyModeEnabled: boolean;
  togglePrivacyMode: () => void;
};

const LocationControls: React.FC<LocationControlsProps> = ({
  getUserLocation,
  isLocating,
  toggleLocationTracking,
  isTracking,
  isManualMode,
  toggleManualMode,
  isPrivacyModeEnabled,
  togglePrivacyMode
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="manual-mode"
          checked={isManualMode}
          onCheckedChange={toggleManualMode}
        />
        <Label htmlFor="manual-mode" className="text-xs whitespace-nowrap">
          <MapPin className="h-3 w-3 inline mr-1" />
          Manual
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="tracking-mode"
          checked={isTracking}
          onCheckedChange={toggleLocationTracking}
        />
        <Label htmlFor="tracking-mode" className="text-xs">
          <Locate className="h-3 w-3 inline mr-1" />
          Track
        </Label>
      </div>
      
      <LocationPrivacyToggle 
        isPrivacyModeEnabled={isPrivacyModeEnabled}
        togglePrivacyMode={togglePrivacyMode}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={getUserLocation}
        disabled={isLocating}
        className="h-8 px-2"
      >
        <Navigation className={`h-4 w-4 mr-1 ${isLocating ? 'animate-spin' : ''}`} />
        <span className="text-xs">Locate</span>
      </Button>
    </div>
  );
};

export default LocationControls;
