
import React from 'react';
import { Eye } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface LocationSettingsProps {
  isManualMode: boolean;
  isPrivacyModeEnabled: boolean;
  isTracking: boolean;
  toggleManualMode: () => void;
  togglePrivacyMode: () => void;
  toggleLocationTracking: () => void;
}

const LocationSettings: React.FC<LocationSettingsProps> = ({
  isTracking,
  toggleLocationTracking
}) => {
  const handleToggle = (handler: () => void) => (e: React.MouseEvent) => {
    // Prevent event propagation to ensure it doesn't interfere with navigation
    e.stopPropagation();
    handler();
  };

  return (
    <>
      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
        <div className="flex items-center space-x-2">
          <Switch
            id="tracking-mode"
            checked={isTracking}
            onCheckedChange={toggleLocationTracking}
          />
          <Label 
            htmlFor="tracking-mode" 
            className="text-sm whitespace-nowrap cursor-pointer"
            onClick={handleToggle(toggleLocationTracking)}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            Track {isTracking ? "On" : "Off"}
          </Label>
        </div>
        
        <div className="text-xs text-gray-600 max-w-xs">
          When tracking is off, you won't appear on the map but can still see others nearby
        </div>
      </div>
    </>
  );
};

export default LocationSettings;
