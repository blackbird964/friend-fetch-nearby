
import React from 'react';

type MapContainerProps = {
  children: React.ReactNode;
  sidePanel?: React.ReactNode;
  showSidePanel?: boolean;
};

const MapContainer: React.FC<MapContainerProps> = ({ 
  children, 
  sidePanel,
  showSidePanel = false 
}) => {
  return (
    <div className="flex h-full relative">
      {/* Map Area */}
      <div className={`flex flex-col relative bg-gray-100 rounded-lg overflow-hidden shadow-inner transition-all duration-300 ${
        showSidePanel ? 'flex-1 rounded-r-none' : 'w-full'
      }`} style={{ minHeight: "400px" }}>
        <div id="map-container" className="absolute inset-0 w-full h-full" />
        {children}
      </div>
      
      {/* Side Panel */}
      {showSidePanel && sidePanel && (
        <div className="w-80 flex-shrink-0 rounded-r-lg overflow-hidden shadow-inner">
          {sidePanel}
        </div>
      )}
    </div>
  );
};

export default MapContainer;
