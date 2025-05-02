import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Style, Stroke } from 'ol/style';
import { useToast } from '@/hooks/use-toast';

// Import custom hooks
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapMarkers } from './hooks/useMapMarkers';
import { useGeolocation } from './hooks/useGeolocation';
import { useMeetingAnimation } from './hooks/useMeetingAnimation';
import { useMapEvents } from './hooks/useMapEvents';

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
  } = useAppContext();
  
  const { toast } = useToast();
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
    WYNYARD_COORDS as [number, number]
  );

  // Set up marker styles
  useEffect(() => {
    if (vectorLayer.current) {
      vectorLayer.current.setStyle((feature: any) => {
        return getMarkerStyle(feature);
      });
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
  }, [selectedUser, movingUsers, completedMoves, getMarkerStyle]);

  // Add map click handlers
  useMapEvents(
    map,
    mapLoaded,
    selectedUser,
    setSelectedUser,
    movingUsers,
    completedMoves,
    vectorLayer
  );

  // Get user's location on initial load - without triggering refreshNearbyUsers
  useEffect(() => {
    if (mapLoaded) {
      // Get user's location after a short delay
      setTimeout(() => {
        getUserLocation();
      }, 500);
    }
  }, [mapLoaded, getUserLocation]);

  // Handle sending a meeting request
  const handleSendRequest = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to send friend requests",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedUser) return;
    
    const user = nearbyUsers.find(u => u.id === selectedUser);
    if (!user) return;
    
    // In a real implementation, we would save this to the database
    // For now, we'll just update the local state and animate
    animateUserToMeeting(user, selectedDuration);
    
    toast({
      title: "Request Sent!",
      description: `You've sent a ${selectedDuration} minute meet-up request to ${user.name}`,
    });
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
      
      <MeetingRequestHandler
        selectedUser={selectedUser}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        onSendRequest={handleSendRequest}
        onCancel={() => setSelectedUser(null)}
        nearbyUsers={nearbyUsers}
      />
    </div>
  );
};

export default FriendMapContainer;
