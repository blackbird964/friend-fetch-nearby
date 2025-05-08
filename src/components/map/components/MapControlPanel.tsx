
import React from 'react';
import RadiusControls from './RadiusControls';
import LocationPrivacyToggle from './LocationPrivacyToggle';

type MapControlPanelProps = {
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  // Privacy control props
  isPrivacyModeEnabled: boolean;
  togglePrivacyMode: () => void;
  // We'll keep these props in the type definition but not use them in the component
  toggleLocationTracking?: () => void;
  isTracking?: boolean;
  isManualMode?: boolean;
  toggleManualMode?: () => void;
};

const MapControlPanel: React.FC<MapControlPanelProps> = ({ 
  radiusInKm, 
  setRadiusInKm,
  isPrivacyModeEnabled,
  togglePrivacyMode,
  // Props below are kept for compatibility but not used
  toggleLocationTracking,
  isTracking = false,
  isManualMode = false,
  toggleManualMode,
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 mx-4 p-3 bg-white rounded-lg shadow-lg z-20">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="font-medium text-sm">Adjust Search Radius</div>
          <LocationPrivacyToggle 
            isPrivacyModeEnabled={isPrivacyModeEnabled} 
            togglePrivacyMode={togglePrivacyMode}
            showLabel={true}
          />
        </div>
        <RadiusControls 
          radiusInKm={radiusInKm} 
          setRadiusInKm={setRadiusInKm} 
        />
      </div>
    </div>
  );
};

export default MapControlPanel;
