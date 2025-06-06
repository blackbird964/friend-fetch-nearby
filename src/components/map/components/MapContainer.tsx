
import React, { ReactNode } from 'react';

interface MapContainerProps {
  children: ReactNode;
}

const MapContainer: React.FC<MapContainerProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Map container with proper z-index */}
      <div 
        id="map-container" 
        className="absolute inset-0 w-full h-full"
        style={{ 
          zIndex: 1,
          pointerEvents: 'auto'
        }}
      />
      
      {/* Overlay components with proper layering */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {children}
      </div>
    </div>
  );
};

export default MapContainer;
