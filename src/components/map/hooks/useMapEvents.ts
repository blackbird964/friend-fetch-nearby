
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

    // Track whether we're inside a popup interaction
    let isInsidePopupInteraction = false;

    // Set up a listener for popup interactions
    const handlePopupInteractionStart = () => {
      isInsidePopupInteraction = true;
      console.log("Popup interaction started");
    };
    
    const handlePopupInteractionEnd = () => {
      isInsidePopupInteraction = false;
      console.log("Popup interaction ended");
    };
    
    // Listen for mousedown events on the popup elements
    document.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.user-popup-card')) {
        handlePopupInteractionStart();
      }
    });
    
    document.addEventListener('mouseup', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.user-popup-card')) {
        handlePopupInteractionEnd();
      }
    });

    const clickHandler = (event: any) => {
      console.log("Map click detected");
      
      // Check if we're currently interacting with a popup
      if (isInsidePopupInteraction) {
        console.log("Inside popup interaction - ignoring map click");
        event.stopPropagation();
        return;
      }
      
      const clickedFeature = map.current?.forEachFeatureAtPixel(event.pixel, (f) => f);
      
      if (clickedFeature) {
        const userId = clickedFeature.get('userId');
        
        if (userId) {
          if (selectedUser === userId) {
            // If we click the same user again, we don't deselect - keep the selection
            // This makes the popup persist when clicking around the user
            console.log("Clicked on currently selected user, keeping selection");
          } else {
            // If clicking a different user, select them
            console.log("Selecting new user:", userId);
            setSelectedUser(userId);
          }
          
          // Update the vector layer
          if (vectorLayer.current) {
            vectorLayer.current.changed();
          }
          
          // Prevent map click event from bubbling up
          event.stopPropagation();
          return;
        }
      } 
      
      // If we're not clicking on a feature, and only if we are outside any popup interaction,
      // check if we need to deselect (clicked on map empty space)
      if (selectedUser) {
        // Use a larger hit tolerance (30px) to make it harder to accidentally deselect
        const featuresNearby = map.current?.getFeaturesAtPixel(event.pixel, {
          hitTolerance: 30 // Increased from 20 to 30 pixel tolerance
        });
        
        // Only deselect if there are absolutely no features nearby
        if (!featuresNearby || featuresNearby.length === 0) {
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
      document.removeEventListener('mousedown', handlePopupInteractionStart);
      document.removeEventListener('mouseup', handlePopupInteractionEnd);
    };
  }, [mapLoaded, selectedUser, movingUsers, completedMoves, map, setSelectedUser, vectorLayer, friendRequests, currentUser]);
};
