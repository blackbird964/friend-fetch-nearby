
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MapZoomControlsProps = {
  map: React.MutableRefObject<any>;
  mapLoaded: boolean;
};

const MapZoomControls: React.FC<MapZoomControlsProps> = ({
  map,
  mapLoaded
}) => {
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mapLoaded || !map.current) return;
    
    const view = map.current.getView();
    const currentZoom = view.getZoom();
    const newZoom = Math.min(currentZoom + 1, 19); // Max zoom level
    
    view.animate({
      zoom: newZoom,
      duration: 250
    });
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mapLoaded || !map.current) return;
    
    const view = map.current.getView();
    const currentZoom = view.getZoom();
    const newZoom = Math.max(currentZoom - 1, 2); // Min zoom level
    
    view.animate({
      zoom: newZoom,
      duration: 250
    });
  };

  if (!mapLoaded) return null;

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-1 z-30">
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomIn}
        className="bg-white shadow-md hover:bg-gray-50 h-10 w-10"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomOut}
        className="bg-white shadow-md hover:bg-gray-50 h-10 w-10"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapZoomControls;
