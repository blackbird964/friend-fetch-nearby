
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Navigation, Locate, MapPin } from 'lucide-react';

type LocationControlsProps = {
  getUserLocation: () => void;
  isLocating: boolean;
  toggleLocationTracking: () => void;
  isTracking: boolean;
  isManualMode: boolean;
  toggleManualMode: () => void;
};

const LocationControls: React.FC<LocationControlsProps> = ({
  getUserLocation,
  isLocating,
  toggleLocationTracking,
  isTracking,
  isManualMode,
  toggleManualMode
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch 
            id="manual-mode" 
            checked={isManualMode}
            onCheckedChange={toggleManualMode}
          />
          <Label htmlFor="manual-mode" className="text-xs">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Manual location
            </div>
          </Label>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={getUserLocation}
          disabled={isLocating}
          className="flex items-center gap-1 py-1 h-8"
        >
          <Navigation className={`h-3 w-3 ${isLocating ? 'animate-pulse' : ''}`} />
          <span className="text-xs">{isManualMode ? 'Set Location' : 'Get Location'}</span>
        </Button>
        
        {!isManualMode && (
          <Button 
            variant={isTracking ? "default" : "outline"} 
            size="sm" 
            onClick={toggleLocationTracking}
            className={`flex items-center gap-1 py-1 h-8 ${isTracking ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            <Locate className={`h-3 w-3 ${isTracking ? 'animate-pulse' : ''}`} />
            <span className="text-xs">{isTracking ? 'Tracking On' : 'Track GPS'}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default LocationControls;
