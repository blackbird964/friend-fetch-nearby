
import React from 'react';
import { Shield, MapPin, Eye } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import LocationPrivacyToggle from '@/components/map/components/LocationPrivacyToggle';

interface LocationSettingsProps {
  isManualMode: boolean;
  isPrivacyModeEnabled: boolean;
  isTracking: boolean;
  toggleManualMode: () => void;
  togglePrivacyMode: () => void;
  toggleLocationTracking: () => void;
}

const LocationSettings: React.FC<LocationSettingsProps> = ({
  isManualMode,
  isPrivacyModeEnabled,
  isTracking,
  toggleManualMode,
  togglePrivacyMode,
  toggleLocationTracking
}) => {
  return (
    <>
      <div className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-1">
            <Switch
              id="manual-mode"
              checked={isManualMode}
              onCheckedChange={toggleManualMode}
              className="scale-75"
            />
            <Label htmlFor="manual-mode" className="text-xs whitespace-nowrap">
              <MapPin className="h-3 w-3 inline mr-1" />
              Manual
            </Label>
          </div>

          <LocationPrivacyToggle 
            isPrivacyModeEnabled={isPrivacyModeEnabled}
            togglePrivacyMode={togglePrivacyMode}
            showLabel={true}
            small={true}
            variant="switch"
          />
        </div>

        <div className="flex items-center space-x-1">
          <Switch
            id="tracking-mode"
            checked={isTracking}
            onCheckedChange={toggleLocationTracking}
            className="scale-75"
          />
          <Label htmlFor="tracking-mode" className="text-xs whitespace-nowrap">
            <Eye className="h-3 w-3 inline mr-1" />
            Track
          </Label>
        </div>
      </div>
      
      {/* Privacy mode indicator */}
      {isPrivacyModeEnabled && (
        <div className="flex items-center justify-center py-1 px-2 bg-purple-50 rounded-md text-xs text-purple-700 border border-purple-100 animate-fade-in">
          <Shield className="h-3 w-3 mr-1 inline shield-pulse text-purple-500" />
          Privacy Mode Active - Your exact location is hidden
        </div>
      )}
    </>
  );
};

export default LocationSettings;
