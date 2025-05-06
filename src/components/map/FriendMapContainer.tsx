
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

// Import custom hooks
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapMarkers } from './hooks/useMapMarkers';
import { useGeolocation } from './hooks/useGeolocation';
import { useMeetingAnimation } from './hooks/useMeetingAnimation';
import { useMapEvents } from './hooks/useMapEvents';
import { useRadiusCircle } from './hooks/useRadiusCircle';
import { useMapStyles } from './hooks/useMapStyles';
import { useLocationHandling } from './hooks/useLocationHandling';
import { useMeetingRequestHandler } from './hooks/useMeetingRequestHandler';

// Import components
import MapControlPanel from './components/MapControlPanel';
import LocationErrorMessage from './components/LocationErrorMessage';
import MeetingRequestHandler from './components/MeetingRequestHandler';

const FriendMapContainer: React.FC = () => {
  
  const { 
    currentUser, 
    nearbyUsers, 
    radiusInKm, 
    setRadiusInKm, 
    setCurrentUser, 
    updateUserLocation,
    friendRequests 
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
    getSafariHelp,
    toggleLocationTracking,
    isTracking,
    isManualMode,
    toggleManualMode
  } = useGeolocation(map, currentUser, updateUserLocation, setCurrentUser);

  // Initialize radius circle
  const { radiusLayer, radiusFeature } = useRadiusCircle(
    map,
    vectorSource,
    currentUser,
    radiusInKm
  );

  // Get marker styles and handle marker updates
  const { getMarkerStyle, WYNYARD_COORDS } = useMapMarkers(
    map, 
    vectorSource, 
    nearbyUsers, 
    currentUser, 
    selectedUser, 
    movingUsers, 
    completedMoves, 
    mapLoaded,
    friendRequests,
    radiusInKm
  );

  // Handle meeting animations
  const { animateUserToMeeting } = useMeetingAnimation(
    vectorSource,
    routeLayer,
    setMovingUsers,
    setCompletedMoves,
    setSelectedUser,
    WYNYARD_COORDS as [number, number]
  );
  
  // Apply styling to map layers
  useMapStyles(
    vectorLayer,
    routeLayer,
    getMarkerStyle,
    selectedUser,
    movingUsers,
    completedMoves,
    friendRequests
  );

  // Add map click handlers
  useMapEvents(
    map,
    mapLoaded,
    selectedUser,
    setSelectedUser,
    movingUsers,
    completedMoves,
    vectorLayer,
    friendRequests,
    currentUser
  );

  // Handle initial location fetching
  useLocationHandling(mapLoaded, getUserLocation);
  
  // Handle meeting request functionality
  const { handleSendRequest } = useMeetingRequestHandler({
    selectedUser,
    nearbyUsers,
    animateUserToMeeting
  });

  // Simplified JSX structure
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden shadow-inner">
        <div ref={mapContainer} className="absolute inset-0" />
        
        <MapControlPanel 
          radiusInKm={radiusInKm}
          setRadiusInKm={setRadiusInKm}
          getUserLocation={getUserLocation}
          isLocating={isLocating}
          toggleLocationTracking={toggleLocationTracking}
          isTracking={isTracking}
          isManualMode={isManualMode}
          toggleManualMode={toggleManualMode}
        />
        
        <LocationErrorMessage 
          locationError={locationError}
          permissionState={permissionState}
          getSafariHelp={getSafariHelp}
        />
      </div>
      
      <MeetingRequestHandler
        selectedUser={selectedUser}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        onSendRequest={() => handleSendRequest(selectedDuration)}
        onCancel={() => setSelectedUser(null)}
        nearbyUsers={nearbyUsers}
        movingUsers={movingUsers}
        completedMoves={completedMoves}
        setMovingUsers={setMovingUsers}
        setCompletedMoves={setCompletedMoves}
      />
    </div>
  );
};

export default FriendMapContainer;
