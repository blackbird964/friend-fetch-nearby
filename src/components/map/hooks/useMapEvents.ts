
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

    // Track various interaction states
    let isInsidePopupInteraction = false;
    let ignoreNextMapClick = false;
    let popupJustOpened = false;
    let lastClickTimestamp = 0;
    
    // Set up listeners for popup interactions
    const handlePopupInteractionStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('.user-popup-card')) {
        isInsidePopupInteraction = true;
        console.log("Popup interaction started");
        e.stopPropagation();
      }
    };
    
    const handlePopupInteractionEnd = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('.user-popup-card')) {
        isInsidePopupInteraction = false;
        console.log("Popup interaction ended");
        // Set a flag to ignore the next map click (prevents deselection)
        ignoreNextMapClick = true;
        e.stopPropagation();
      }
    };
    
    // Track the last clicked feature to prevent deselection when clicking the same feature again
    let lastClickedFeatureId: string | null = null;

    const clickHandler = (event: any) => {
      const currentTime = Date.now();
      console.log("Map click detected");
      
      // Debounce clicks that happen too quickly (helps prevent double processing)
      if (currentTime - lastClickTimestamp < 300) {
        console.log("Click debounced - too soon after last click");
        return;
      }
      lastClickTimestamp = currentTime;
      
      // Check if we should ignore this click (after popup interaction)
      if (ignoreNextMapClick) {
        console.log("Ignoring map click due to recent popup interaction");
        ignoreNextMapClick = false;
        return;
      }
      
      // Check if we're currently interacting with a popup
      if (isInsidePopupInteraction) {
        console.log("Inside popup interaction - ignoring map click");
        return;
      }
      
      // If a popup was just opened, prevent immediate deselection
      if (popupJustOpened) {
        console.log("Popup just opened - ignoring potential deselection");
        popupJustOpened = false;
        event.stopPropagation();
        return;
      }
      
      const clickedFeature = map.current?.forEachFeatureAtPixel(event.pixel, (f) => f);
      
      if (clickedFeature) {
        const userId = clickedFeature.get('userId');
        const isCircle = clickedFeature.get('isCircle');
        
        // Only process clicks on user markers, not circles
        if (userId && !isCircle) {
          console.log("Clicked on user feature:", userId);
          
          // Don't select your own marker for meeting requests
          if (currentUser && userId === currentUser.id) {
            console.log("This is your own marker, not selecting");
            return;
          }
          
          lastClickedFeatureId = userId;
          
          // Always select the user when clicking on their marker
          setSelectedUser(userId);
          popupJustOpened = true;
          
          // Update the vector layer
          if (vectorLayer.current) {
            vectorLayer.current.changed();
          }
          
          // Prevent map click event from bubbling up
          event.stopPropagation();
          return;
        }
      } 
      
      // Handle potential deselection when clicking away
      if (selectedUser) {
        console.log("Handling potential deselection, selectedUser:", selectedUser);
        
        // Don't deselect if we just clicked on the same feature
        if (lastClickedFeatureId === selectedUser) {
          console.log("Clicked on selected user, not deselecting");
          return;
        }
        
        // Use a smaller hit tolerance (20px) to make it easier to deselect
        const featuresNearby = map.current?.getFeaturesAtPixel(event.pixel, {
          hitTolerance: 20
        });
        
        // Check if we clicked on something related to the selected user
        const isNearSelectedFeature = featuresNearby?.some((f) => {
          return f.get('userId') === selectedUser;
        });
        
        // Check if we clicked inside the popup area (approximate check)
        const mapSize = map.current?.getSize();
        const clickX = event.pixel[0];
        const clickY = event.pixel[1];
        
        // Define a "safe zone" in the bottom center of map where popups typically appear
        const isSafeZone = mapSize && 
          clickX > mapSize[0] * 0.2 && 
          clickX < mapSize[0] * 0.8 && 
          clickY > mapSize[1] * 0.6;
          
        if (isSafeZone) {
          console.log("Click in popup safe zone, not deselecting");
          return;
        }
        
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

    // Attach document-level event listeners for popup interactions
    document.addEventListener('mousedown', handlePopupInteractionStart, { capture: true });
    document.addEventListener('touchstart', handlePopupInteractionStart, { capture: true });
    document.addEventListener('mouseup', handlePopupInteractionEnd, { capture: true });
    document.addEventListener('touchend', handlePopupInteractionEnd, { capture: true });
    document.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.user-popup-card')) {
        e.stopPropagation();
      }
    }, { capture: true });
    
    // Attach map click handler
    map.current.on('click', clickHandler);

    return () => {
      map.current?.un('click', clickHandler);
      document.removeEventListener('mousedown', handlePopupInteractionStart, { capture: true });
      document.removeEventListener('touchstart', handlePopupInteractionStart, { capture: true });
      document.removeEventListener('mouseup', handlePopupInteractionEnd, { capture: true });
      document.removeEventListener('touchend', handlePopupInteractionEnd, { capture: true });
    };
  }, [mapLoaded, selectedUser, movingUsers, completedMoves, map, setSelectedUser, vectorLayer, friendRequests, currentUser]);
};
