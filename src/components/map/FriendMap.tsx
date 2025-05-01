
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { AlertTriangle } from 'lucide-react';
import { Style, Circle, Fill, Stroke, Text } from 'ol/style';
import 'ol/ol.css';

// Import custom hooks
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapMarkers } from './hooks/useMapMarkers';
import { useGeolocation } from './hooks/useGeolocation';
import { useMeetingAnimation } from './hooks/useMeetingAnimation';

// Import components
import MapControlPanel from './components/MapControlPanel';
import UserRequestCard from './components/UserRequestCard';
import LocationErrorMessage from './components/LocationErrorMessage';

const FriendMap: React.FC = () => {
  const { 
    currentUser, 
    nearbyUsers, 
    radiusInKm, 
    setRadiusInKm, 
    setCurrentUser, 
    updateUserLocation 
  } = useAppContext();
  
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [movingUsers, setMovingUsers] = useState<Set<string>>(new Set());
  const [completedMoves, setCompletedMoves] = useState<Set<string>>(new Set());

  // Initialize map with references
  const { 
    mapContainer, 
    map, 
    vectorSource, 
    vectorLayer, 
    routeLayer, 
    mapLoaded 
  } = useMapInitialization();

  // Handle geolocation
  const {
    getUserLocation,
    isLocating,
    locationError,
    permissionState,
    getSafariHelp
  } = useGeolocation(map, currentUser, updateUserLocation, setCurrentUser);

  // Handle map markers
  const { getMarkerStyle, WYNYARD_COORDS } = useMapMarkers(
    map, 
    vectorSource, 
    nearbyUsers, 
    currentUser, 
    selectedUser, 
    movingUsers, 
    completedMoves, 
    mapLoaded
  );

  // Handle meeting animations
  const { animateUserToMeeting } = useMeetingAnimation(
    vectorSource,
    routeLayer,
    setMovingUsers,
    setCompletedMoves,
    setSelectedUser,
    WYNYARD_COORDS
  );

  // Set up marker styles
  useEffect(() => {
    if (vectorLayer.current) {
      vectorLayer.current.setStyle((feature) => getMarkerStyle(feature));
    }
    
    if (routeLayer.current) {
      routeLayer.current.setStyle(new Style({
        stroke: new Stroke({
          color: '#10b981',
          width: 2,
          lineDash: [5, 5]
        })
      }));
    }
  }, [selectedUser, movingUsers, completedMoves]);

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
  }, [mapLoaded, selectedUser, movingUsers, completedMoves]);

  // Get user's location on initial load
  useEffect(() => {
    if (mapLoaded) {
      // Get user's location after a short delay
      setTimeout(() => {
        getUserLocation();
      }, 500);
    }
  }, [mapLoaded]);

  // Handle sending a meeting request
  const handleSendRequest = () => {
    if (!selectedUser) return;
    
    const user = nearbyUsers.find(u => u.id === selectedUser);
    if (!user) return;

    animateUserToMeeting(user, selectedDuration);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden shadow-inner">
        <div ref={mapContainer} className="absolute inset-0" />
        
        <MapControlPanel 
          radiusInKm={radiusInKm}
          setRadiusInKm={setRadiusInKm}
          getUserLocation={getUserLocation}
          isLocating={isLocating}
        />
        
        <LocationErrorMessage 
          locationError={locationError}
          permissionState={permissionState}
          getSafariHelp={getSafariHelp}
        />
      </div>
      
      {selectedUser && (
        <UserRequestCard 
          user={nearbyUsers.find(u => u.id === selectedUser)!}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          onSendRequest={handleSendRequest}
          onCancel={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default FriendMap;
