
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Navigation, Map, Crosshair, Locate } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

type MapControlPanelProps = {
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  getUserLocation: () => void;
  isLocating: boolean;
  toggleLocationTracking: () => void;
  isTracking: boolean;
};

const MapControlPanel: React.FC<MapControlPanelProps> = ({ 
  radiusInKm, 
  setRadiusInKm, 
  getUserLocation, 
  isLocating,
  toggleLocationTracking,
  isTracking
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 mx-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg z-10">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Search Radius: {radiusInKm} km</div>
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
        </div>
        <div>
          <Slider 
            value={[radiusInKm]} 
            min={1} 
            max={100}
            step={1}
            onValueChange={([value]) => setRadiusInKm(value)} 
            className="py-1"
          />
        </div>
      </div>
    </div>
  );
};

export default MapControlPanel;
