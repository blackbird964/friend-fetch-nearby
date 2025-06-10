
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

type MapContainerProps = {
  children: React.ReactNode;
  sidePanel?: React.ReactNode;
  showSidePanel?: boolean;
  mobileDrawer?: React.ReactNode;
};

const MapContainer: React.FC<MapContainerProps> = ({ 
  children, 
  sidePanel,
  showSidePanel = false,
  mobileDrawer
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-full relative">
      {/* Map Area */}
      <div className={`flex flex-col relative bg-gray-100 rounded-lg overflow-hidden shadow-inner transition-all duration-300 ${
        showSidePanel && !isMobile ? 'flex-1 rounded-r-none' : 'w-full'
      }`} style={{ minHeight: "400px" }}>
        <div id="map-container" className="absolute inset-0 w-full h-full" />
        {children}
      </div>
      
      {/* Desktop Side Panel */}
      {showSidePanel && sidePanel && !isMobile && (
        <div className="w-80 flex-shrink-0 rounded-r-lg overflow-hidden shadow-inner">
          {sidePanel}
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobile && mobileDrawer}
    </div>
  );
};

export default MapContainer;
