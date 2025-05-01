
import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Navigation, User } from 'lucide-react';

interface MapControlPanelProps {
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  getUserLocation: () => void;
  isLocating: boolean;
}

const MapControlPanel: React.FC<MapControlPanelProps> = ({
  radiusInKm,
  setRadiusInKm,
  getUserLocation,
  isLocating
}) => {
  return (
    <>
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="default" 
          size="sm"
          onClick={getUserLocation}
          disabled={isLocating}
          className="flex items-center gap-2"
        >
          <Navigation className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Locating...' : 'Update My Location'}
        </Button>
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center text-sm text-gray-600">
            <User className="mr-1 h-4 w-4 text-primary" />
            <span>Radius</span>
          </div>
          <span className="text-sm font-medium">{radiusInKm} km</span>
        </div>
        <Slider
          value={[radiusInKm]}
          min={1}
          max={60}
          step={1}
          onValueChange={(value) => setRadiusInKm(value[0])}
        />
      </div>
    </>
  );
};

export default MapControlPanel;
