
import React, { useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useMapInitialization } from '../hooks/useMapInitialization';

type MapContainerProps = {
  children: React.ReactNode;
};

const MapContainer: React.FC<MapContainerProps> = ({ children }) => {
  const { mapContainer, map, vectorSource, vectorLayer, routeLayer, mapLoaded } = useMapInitialization();

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden shadow-inner">
        <div ref={mapContainer} className="absolute inset-0" />
        {children}
      </div>
    </div>
  );
};

export default MapContainer;
