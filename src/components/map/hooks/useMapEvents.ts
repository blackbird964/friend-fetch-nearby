
import { useEffect } from 'react';
import { Map } from 'ol';
import Feature from 'ol/Feature';
import { FriendRequest } from '@/context/types';

export const useMapEvents = (
  map: React.MutableRefObject<Map | null>,
  mapLoaded: boolean,
  selectedUser: string | null,
  setSelectedUser: (userId: string | null) => void,
  movingUsers: Set<string>,
  completedMoves: Set<string>,
  vectorLayer: any,
  friendRequests: FriendRequest[],
  currentUser: { id: string } | null
) => {
  // Add click handler for markers
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const clickHandler = (event: any) => {
      const clickedFeature = map.current?.forEachFeatureAtPixel(event.pixel, (f) => f);
      
      if (clickedFeature) {
        const userId = clickedFeature.get('userId');
        
        if (userId) {
          // Always allow toggling selection, even for moving or completed users
          if (selectedUser === userId) {
            // If we click the same user again, toggle the selection off
            setSelectedUser(null);
          } else {
            // Otherwise, select the user
            setSelectedUser(userId);
          }
          
          // In either case, we need to update the vector layer
          if (vectorLayer.current) {
            vectorLayer.current.changed();
          }
        }
      } else if (selectedUser) {
        // If clicking outside a marker, deselect
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
  }, [mapLoaded, selectedUser, movingUsers, completedMoves, map, setSelectedUser, vectorLayer, friendRequests, currentUser]);
};
