
import React from 'react';
import { Button } from "@/components/ui/button";
import { Navigation, Locate } from 'lucide-react';

type LocationControlsProps = {
  getUserLocation: () => void;
  isLocating: boolean;
  toggleLocationTracking: () => void;
  isTracking: boolean;
};

const LocationControls: React.FC<LocationControlsProps> = ({
  getUserLocation,
  isLocating,
  toggleLocationTracking,
  isTracking
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={getUserLocation}
        disabled={isLocating}
        className="flex items-center gap-1 py-1 h-8"
      >
        <Navigation className={`h-3 w-3 ${isLocating ? 'animate-pulse' : ''}`} />
        <span className="text-xs">Get Location</span>
      </Button>
      <Button 
        variant={isTracking ? "default" : "outline"} 
        size="sm" 
        onClick={toggleLocationTracking}
        className={`flex items-center gap-1 py-1 h-8 ${isTracking ? 'bg-green-600 hover:bg-green-700' : ''}`}
      >
        <Locate className={`h-3 w-3 ${isTracking ? 'animate-pulse' : ''}`} />
        <span className="text-xs">{isTracking ? 'Tracking On' : 'Track GPS'}</span>
      </Button>
    </div>
  );
};

export default LocationControls;
