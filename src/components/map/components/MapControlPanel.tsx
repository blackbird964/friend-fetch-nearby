import React from 'react';
import RadiusControls from './RadiusControls';

type MapControlPanelProps = {
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
  // We'll keep these props in the type definition but not use them in the component
  toggleLocationTracking?: () => void;
  isTracking?: boolean;
  isManualMode?: boolean;
  toggleManualMode?: () => void;
  isPrivacyModeEnabled?: boolean;
  togglePrivacyMode?: () => void;
};

const MapControlPanel: React.FC<MapControlPanelProps> = ({ 
  radiusInKm, 
  setRadiusInKm,
  // Props below are kept for compatibility but not used
  toggleLocationTracking,
  isTracking = false,
  isManualMode = false,
  toggleManualMode,
  isPrivacyModeEnabled = false,
  togglePrivacyMode
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 mx-4 p-3 bg-white rounded-lg shadow-lg z-10">
      <div className="flex flex-col gap-3">
        <RadiusControls 
          radiusInKm={radiusInKm} 
          setRadiusInKm={setRadiusInKm} 
        />
        {/* Location controls removed from here to avoid duplication */}
      </div>
    </div>
  );
};

export default MapControlPanel;
