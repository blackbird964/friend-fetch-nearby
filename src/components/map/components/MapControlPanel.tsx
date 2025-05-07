
import React from 'react';
import RadiusControls from './RadiusControls';

type MapControlPanelProps = {
  radiusInKm: number;
  setRadiusInKm: (radius: number) => void;
};

const MapControlPanel: React.FC<MapControlPanelProps> = ({ 
  radiusInKm, 
  setRadiusInKm
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 mx-4 p-3 bg-white rounded-lg shadow-lg z-10">
      <div className="flex flex-col gap-3">
        <RadiusControls 
          radiusInKm={radiusInKm} 
          setRadiusInKm={setRadiusInKm} 
        />
      </div>
    </div>
  );
};

export default MapControlPanel;
