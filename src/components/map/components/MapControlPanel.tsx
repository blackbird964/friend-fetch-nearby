
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
  isManualMode: boolean;
  toggleManualMode: () => void;
  isPrivacyModeEnabled: boolean;
  togglePrivacyMode: () => void;
};

const MapControlPanel: React.FC<MapControlPanelProps> = ({ 
  radiusInKm, 
  setRadiusInKm, 
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
    <div className="absolute bottom-4 left-0 right-0 mx-4 p-3 bg-white rounded-lg shadow-lg z-10">
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
            isManualMode={isManualMode}
            toggleManualMode={toggleManualMode}
            isPrivacyModeEnabled={isPrivacyModeEnabled}
            togglePrivacyMode={togglePrivacyMode}
          />
        </div>
      </div>
    </div>
  );
};

export default MapControlPanel;
