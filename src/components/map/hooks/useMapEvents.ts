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
            // If we click the same user again, we don't deselect - keep the selection
            // This makes the popup persist when clicking around the user
            console.log("Clicked on currently selected user, keeping selection");
          } else {
            // If clicking a different user, select them
            console.log("Selecting new user:", userId);
            setSelectedUser(userId);
          }
          
          // In either case, we need to update the vector layer
          if (vectorLayer.current) {
            vectorLayer.current.changed();
          }
          
          // Prevent map click event from bubbling up to avoid deselection
          event.stopPropagation();
          return;
        }
      } 
      
      // If we reach here, check if we need to deselect (clicked on map empty space)
      // But only do it if we're more than 20 pixels away from any feature
      // This creates a buffer zone around markers where clicking won't deselect
      if (selectedUser) {
        // Check if there are any features within 20 pixels
        const featuresNearby = map.current?.getFeaturesAtPixel(event.pixel, {
          hitTolerance: 20 // 20 pixel tolerance for keeping selection
        });
        
        if (!featuresNearby || featuresNearby.length === 0) {
          // If no features nearby, deselect
          console.log("Clicked away from users, deselecting");
          setSelectedUser(null);
          if (vectorLayer.current) {
            vectorLayer.current.changed();
          }
        } else {
          console.log("Clicked near a feature, keeping selection");
        }
      }
    };

    map.current.on('click', clickHandler);

    return () => {
      map.current?.un('click', clickHandler);
    };
  }, [mapLoaded, selectedUser, movingUsers, completedMoves, map, setSelectedUser, vectorLayer, friendRequests, currentUser]);
};
