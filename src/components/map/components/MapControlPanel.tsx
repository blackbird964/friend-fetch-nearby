
import React from 'react';
import RadiusControls from './RadiusControls';
import LocationControls from './LocationControls';

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
        <RadiusControls 
          radiusInKm={radiusInKm} 
          setRadiusInKm={setRadiusInKm} 
        />
        <div className="flex justify-end">
          <LocationControls
            getUserLocation={getUserLocation}
            isLocating={isLocating}
            toggleLocationTracking={toggleLocationTracking}
            isTracking={isTracking}
          />
        </div>
      </div>
    </div>
  );
};

export default MapControlPanel;
