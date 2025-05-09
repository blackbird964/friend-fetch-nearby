
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
    
    // Track the last clicked feature to prevent deselection when clicking the same feature again
    let lastClickedFeatureId: string | null = null;

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
          console.log("Clicked on user feature:", userId);
          lastClickedFeatureId = userId;
          
          // Always select the user when clicking on their marker
          setSelectedUser(userId);
          
          // Update the vector layer
          if (vectorLayer.current) {
            vectorLayer.current.changed();
          }
          
          // Prevent map click event from bubbling up
          event.stopPropagation();
          return;
        }
      } 
      
      // If we're not clicking on a feature, check if we need to deselect
      // Only deselect if we clicked somewhere away from the selected user and popups
      if (selectedUser) {
        // Don't deselect if the user just clicked on a feature
        if (lastClickedFeatureId === selectedUser) {
          console.log("Clicked on selected user, not deselecting");
          return;
        }
        
        // Use a larger hit tolerance (30px) to make it harder to accidentally deselect
        const featuresNearby = map.current?.getFeaturesAtPixel(event.pixel, {
          hitTolerance: 30 // Increased from 20 to 30 pixel tolerance
        });
        
        // Check if we clicked on something related to the selected user
        const isNearSelectedFeature = featuresNearby?.some((f) => {
          return f.get('userId') === selectedUser;
        });
        
        // Only deselect if there are no features nearby or none related to the selected user
        if (!featuresNearby || featuresNearby.length === 0 || !isNearSelectedFeature) {
          console.log("Clicked away from users, deselecting");
          setSelectedUser(null);
          lastClickedFeatureId = null;
          if (vectorLayer.current) {
            vectorLayer.current.changed();
          }
        } else {
          console.log("Clicked near the selected feature, keeping selection");
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
