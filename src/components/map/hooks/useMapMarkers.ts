
import { useEffect, useRef } from 'react';
import { AppUser } from '@/context/types';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import Map from 'ol/Map';
import { WYNYARD_COORDS } from './useMapInitialization';

export const useMapMarkers = (
  map: React.MutableRefObject<Map | null>,
  vectorSource: React.MutableRefObject<VectorSource | null>,
  nearbyUsers: AppUser[],
  currentUser: AppUser | null,
  selectedUser: string | null,
  movingUsers: Set<string>,
  completedMoves: Set<string>,
  mapLoaded: boolean
) => {
  // Set up marker styles
  const getMarkerStyle = (feature: Feature) => {
    const isMoving = movingUsers.has(feature.get('userId'));
    const isUser = feature.get('isCurrentUser');
    const hasMoved = completedMoves.has(feature.get('userId'));
    
    return new Style({
      image: new CircleStyle({
        radius: isUser ? 10 : 8,
        fill: new Fill({ 
          color: isUser ? '#0ea5e9' : 
                 isMoving ? '#10b981' :
                 hasMoved ? '#10b981' :
                 selectedUser === feature.get('userId') ? '#6366f1' : '#6366f1' 
        }),
        stroke: new Stroke({ 
          color: isUser ? '#0369a1' : 'white', 
          width: isUser ? 3 : 2 
        })
      }),
      text: new Text({
        text: feature.get('name'),
        offsetY: -15,
        fill: new Fill({ color: '#374151' }),
        stroke: new Stroke({ color: 'white', width: 2 })
      })
    });
  };

  // Update map markers when user data changes
  useEffect(() => {
    if (!mapLoaded || !vectorSource.current) return;

    // Clear existing user markers
    const features = vectorSource.current.getFeatures();
    features.forEach(feature => {
      if (!feature.get('isCurrentUser')) {
        vectorSource.current?.removeFeature(feature);
      }
    });

    // Add markers for nearby users with their locations
    nearbyUsers.forEach(user => {
      if (user.location && user.location.lat && user.location.lng) {
        const userFeature = new Feature({
          geometry: new Point(fromLonLat([user.location.lng, user.location.lat])),
          userId: user.id,
          name: user.name || `User-${user.id.substring(0, 4)}`
        });
        vectorSource.current?.addFeature(userFeature);
      }
    });

    // Add current user marker with the updated location
    if (currentUser?.location?.lat && currentUser?.location?.lng) {
      // Remove any existing current user marker
      const existingUserFeatures = vectorSource.current.getFeatures().filter(feature => feature.get('isCurrentUser'));
      existingUserFeatures.forEach(feature => {
        vectorSource.current?.removeFeature(feature);
      });

      // Add updated user marker
      const userFeature = new Feature({
        geometry: new Point(fromLonLat([currentUser.location.lng, currentUser.location.lat])),
        isCurrentUser: true,
        name: 'You'
      });
      vectorSource.current.addFeature(userFeature);
    }

    return () => {
      // Cleanup if needed
    };
  }, [nearbyUsers, mapLoaded, currentUser?.location, selectedUser, movingUsers, completedMoves]);

  return { getMarkerStyle, WYNYARD_COORDS };
};
