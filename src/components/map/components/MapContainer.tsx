
import React from 'react';

type MapContainerProps = {
  children: React.ReactNode;
};

const MapContainer: React.FC<MapContainerProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden shadow-inner" style={{ minHeight: "400px" }}>
        <div id="map-container" className="absolute inset-0 w-full h-full" />
        {children}
      </div>
    </div>
  );
};

export default MapContainer;
