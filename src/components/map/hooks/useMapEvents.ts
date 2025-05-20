
import { useEffect } from 'react';
import { Map } from 'ol';
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
    let lastClickTimestamp = 0;
    
    // Set up listeners for popup interactions
    const handlePopupInteractionStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('.user-popup-card') || 
          target.closest('button') ||
          target.tagName === 'BUTTON') {
        isInsidePopupInteraction = true;
        console.log("Popup interaction started", target.tagName);
      }
    };
    
    const handlePopupInteractionEnd = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('.user-popup-card') || 
          target.closest('button') ||
          target.tagName === 'BUTTON') {
        isInsidePopupInteraction = false;
        console.log("Popup interaction ended", target.tagName);
        // Set a flag to ignore the next map click (prevents deselection)
        ignoreNextMapClick = true;
        
        // Set a timeout to reset the flag after a short delay
        setTimeout(() => {
          ignoreNextMapClick = false;
        }, 300);
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
      
      const clickedFeature = map.current?.forEachFeatureAtPixel(event.pixel, (f: any) => f);
      
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
          console.log("User selected:", userId);
          
          // Update the vector layer
          if (vectorLayer.current) {
            vectorLayer.current.changed();
          }
          
          // Prevent further processing of this click
          event.stopPropagation();
          return;
        }
      } else {
        // Only handle deselection if we have a selected user and didn't click on a feature
        if (selectedUser) {
          console.log("Clicked away from markers, deselecting user");
          setSelectedUser(null);
          lastClickedFeatureId = null;
        }
      }
    };

    // Attach document-level event listeners for popup interactions
    document.addEventListener('mousedown', handlePopupInteractionStart);
    document.addEventListener('touchstart', handlePopupInteractionStart);
    document.addEventListener('mouseup', handlePopupInteractionEnd);
    document.addEventListener('touchend', handlePopupInteractionEnd);
    
    // Add special handling for buttons to prevent map interaction
    const handleButtonInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.tagName === 'BUTTON') {
        console.log("Button interaction detected");
        e.stopPropagation();
        ignoreNextMapClick = true;
        
        // Set a timeout to reset the flag after a short delay
        setTimeout(() => {
          ignoreNextMapClick = false;
        }, 300);
      }
    };
    
    document.addEventListener('click', handleButtonInteraction, { capture: true });
    
    // Attach map click handler
    map.current.on('click', clickHandler);

    return () => {
      if (map.current) {
        map.current.un('click', clickHandler);
      }
      document.removeEventListener('mousedown', handlePopupInteractionStart);
      document.removeEventListener('touchstart', handlePopupInteractionStart);
      document.removeEventListener('mouseup', handlePopupInteractionEnd);
      document.removeEventListener('touchend', handlePopupInteractionEnd);
      document.removeEventListener('click', handleButtonInteraction, { capture: true });
    };
  }, [mapLoaded, selectedUser, movingUsers, completedMoves, map, setSelectedUser, vectorLayer, friendRequests, currentUser]);
};
