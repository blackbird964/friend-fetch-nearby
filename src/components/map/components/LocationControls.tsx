
import React from 'react';
import { MapPin, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import LocationPrivacyToggle from './LocationPrivacyToggle';

type LocationControlsProps = {
  toggleLocationTracking: () => void;
  isTracking: boolean;
  isManualMode: boolean;
  toggleManualMode: () => void;
  isPrivacyModeEnabled: boolean;
  togglePrivacyMode: () => void;
};

const LocationControls: React.FC<LocationControlsProps> = ({
  toggleLocationTracking,
  isTracking,
  isManualMode,
  toggleManualMode,
  isPrivacyModeEnabled,
  togglePrivacyMode
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full items-center">
      <div className="flex items-center space-x-2 justify-start">
        <div className="flex items-center space-x-1">
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
      </div>
      
      <div className="flex justify-center">
        <LocationPrivacyToggle 
          isPrivacyModeEnabled={isPrivacyModeEnabled}
          togglePrivacyMode={togglePrivacyMode}
          showLabel={true}
        />
      </div>

      <div className="flex items-center space-x-1 justify-end">
        <Switch
          id="tracking-mode"
          checked={isTracking}
          onCheckedChange={toggleLocationTracking}
        />
        <Label htmlFor="tracking-mode" className="text-xs whitespace-nowrap">
          <Eye className="h-3 w-3 inline mr-1" />
          Track {isTracking ? "On" : "Off"}
        </Label>
      </div>
    </div>
  );
};

export default LocationControls;
