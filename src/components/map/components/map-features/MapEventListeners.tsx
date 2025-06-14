
import React, { useEffect } from 'react';
import { AppUser, FriendRequest } from '@/context/types';
import Map from 'ol/Map';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Select } from 'ol/interaction';
import { click } from 'ol/events/condition';
import Feature from 'ol/Feature';

interface MapEventListenersProps {
  map: React.MutableRefObject<Map | null>;
  mapLoaded: boolean;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  movingUsers: Set<string>;
  completedMoves: Set<string>;
  vectorLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>;
  friendRequests: FriendRequest[];
  currentUser: AppUser | null;
}

const MapEventListeners: React.FC<MapEventListenersProps> = ({
  map,
  mapLoaded,
  selectedUser,
  setSelectedUser,
  movingUsers,
  completedMoves,
  vectorLayer,
  friendRequests,
  currentUser
}) => {
  // Set up map click interactions
  useEffect(() => {
    if (!map.current || !mapLoaded || !vectorLayer.current) return;

    const selectInteraction = new Select({
      condition: click,
      layers: [vectorLayer.current]
    });

    map.current.addInteraction(selectInteraction);

    selectInteraction.on('select', (event) => {
      const selectedFeatures = event.selected;
      
      if (selectedFeatures.length > 0) {
        const feature = selectedFeatures[0] as Feature;
        const userId = feature.get('userId');
        const isCluster = feature.get('isCluster');
        const isCurrentUser = feature.get('isCurrentUser');
        const isCircle = feature.get('isCircle');
        
        // Don't select circles, current user, or clusters
        if (isCircle || isCurrentUser || isCluster) {
          selectInteraction.getFeatures().clear();
          return;
        }
        
        // Don't select users who are moving or have completed moves
        if (userId && (movingUsers.has(userId) || completedMoves.has(userId))) {
          console.log(`User ${userId} is in motion state, ignoring selection`);
          selectInteraction.getFeatures().clear();
          return;
        }
        
        if (userId && userId !== selectedUser) {
          console.log("MapEventListeners - User selected:", userId);
          setSelectedUser(userId);
        }
        
        // Clear selection to allow re-selection
        selectInteraction.getFeatures().clear();
      } else {
        // Clicked on empty area
        if (selectedUser) {
          console.log("MapEventListeners - Clearing selection");
          setSelectedUser(null);
        }
      }
    });

    return () => {
      map.current?.removeInteraction(selectInteraction);
    };
  }, [map, mapLoaded, vectorLayer, selectedUser, setSelectedUser, movingUsers, completedMoves]);

  // Add zoom event listeners to preserve marker visibility
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    let zoomTimeout: number | null = null;

    const handleZoomStart = () => {
      window.dispatchEvent(new CustomEvent('map-zoom-start'));
      
      // Clear any existing timeout
      if (zoomTimeout) {
        window.clearTimeout(zoomTimeout);
      }
    };

    const handleZoomEnd = () => {
      // Debounce zoom end events
      if (zoomTimeout) {
        window.clearTimeout(zoomTimeout);
      }
      
      zoomTimeout = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('map-zoom-end'));
        zoomTimeout = null;
      }, 150);
    };

    // Listen for view changes (zoom and pan)
    const view = map.current.getView();
    
    // Use proper event names for OpenLayers View
    view.on('change:resolution', handleZoomStart);
    view.on('change:center', handleZoomEnd);

    return () => {
      view.un('change:resolution', handleZoomStart);
      view.un('change:center', handleZoomEnd);
      
      if (zoomTimeout) {
        window.clearTimeout(zoomTimeout);
      }
    };
  }, [map, mapLoaded]);

  return null;
};

export default MapEventListeners;
