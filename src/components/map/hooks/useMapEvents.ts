
import { useEffect } from 'react';
import { Map } from 'ol';
import Feature from 'ol/Feature';

export const useMapEvents = (
  map: React.MutableRefObject<Map | null>,
  mapLoaded: boolean,
  selectedUser: string | null,
  setSelectedUser: (userId: string | null) => void,
  movingUsers: Set<string>,
  completedMoves: Set<string>,
  vectorLayer: any
) => {
  // Add click handler for markers
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const clickHandler = (event: any) => {
      const clickedFeature = map.current?.forEachFeatureAtPixel(event.pixel, (f) => f);
      
      if (clickedFeature) {
        const userId = clickedFeature.get('userId');
        if (userId && !movingUsers.has(userId) && !completedMoves.has(userId)) {
          setSelectedUser(userId);
          if (vectorLayer.current) {
            vectorLayer.current.changed();
          }
        }
      } else if (selectedUser) {
        setSelectedUser(null);
        if (vectorLayer.current) {
          vectorLayer.current.changed();
        }
      }
    };

    map.current.on('click', clickHandler);

    return () => {
      map.current?.un('click', clickHandler);
    };
  }, [mapLoaded, selectedUser, movingUsers, completedMoves, map, setSelectedUser, vectorLayer]);
};
