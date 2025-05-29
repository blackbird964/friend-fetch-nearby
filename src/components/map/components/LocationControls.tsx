
import React from 'react';
import { Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  isTracking
}) => {
  const handleToggle = (handler: () => void) => (e: React.MouseEvent) => {
    // This ensures the click doesn't bubble up to parent elements
    e.stopPropagation();
    handler();
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center space-x-2">
        <Switch
          id="tracking-mode-control"
          checked={isTracking}
          onCheckedChange={toggleLocationTracking}
        />
        <Label 
          htmlFor="tracking-mode-control" 
          className={`text-xs whitespace-nowrap cursor-pointer ${isTracking ? 'text-green-600 font-medium' : 'text-gray-500'}`}
          onClick={handleToggle(toggleLocationTracking)}
        >
          <Eye className={`h-3 w-3 inline mr-1 ${isTracking ? 'text-green-600' : ''}`} />
          Track {isTracking ? "On" : "Off"}
        </Label>
      </div>
    </div>
  );
};

export default LocationControls;
