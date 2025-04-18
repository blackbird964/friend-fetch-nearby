
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { MapPin, User, Clock, MapPinOff } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import UserCard from '@/components/users/UserCard';
import { useToast } from "@/components/ui/use-toast";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const FriendMap: React.FC = () => {
  const { currentUser, nearbyUsers, radiusInKm, setRadiusInKm, friendRequests, setFriendRequests } = useAppContext();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [mapboxToken, setMapboxToken] = useState<string>(localStorage.getItem('mapboxToken') || '');
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!mapboxToken) return;
    
    localStorage.setItem('mapboxToken', mapboxToken);
    
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.006, 40.7128], // Default to NYC
      zoom: 12
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map.current) {
            map.current.setCenter([position.coords.longitude, position.coords.latitude]);
            // Add marker for current user
            new mapboxgl.Marker({ color: '#0ea5e9' })
              .setLngLat([position.coords.longitude, position.coords.latitude])
              .addTo(map.current);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Access Required",
            description: "Please enable location services to use the map features.",
            variant: "destructive"
          });
        }
      );
    }

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken]);

  // Update markers for nearby users
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for nearby users
    nearbyUsers.forEach((user) => {
      if (user.location) {
        const el = document.createElement('div');
        el.className = 'marker-container';
        el.innerHTML = `
          <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-lg cursor-pointer transform transition-transform hover:scale-110">
            <img 
              src="${user.profile_pic || ''}" 
              alt="${user.name}" 
              class="w-full h-full object-cover"
            />
          </div>
        `;

        el.addEventListener('click', () => {
          setSelectedUser(user.id === selectedUser ? null : user.id);
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([user.location.lng, user.location.lat])
          .addTo(map.current!);

        markersRef.current[user.id] = marker;
      }
    });
  }, [nearbyUsers, mapLoaded, selectedUser]);

  const handleSendRequest = () => {
    if (!selectedUser) return;
    
    const user = nearbyUsers.find(u => u.id === selectedUser);
    if (!user) return;
    
    const newRequest = {
      id: `fr${Date.now()}`,
      receiverId: user.id,
      receiverName: user.name,
      receiverProfilePic: user.profile_pic,
      duration: selectedDuration,
      status: 'sent',
      timestamp: Date.now(),
    };
    
    toast({
      title: "Friend request sent!",
      description: `You sent a request to meet with ${user.name} for ${selectedDuration} minutes.`,
    });
    
    setSelectedUser(null);
  };

  const availableTimes = [15, 30, 45];

  if (!mapboxToken) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-lg font-semibold">Mapbox Configuration Required</h2>
        <p className="text-sm text-gray-600">
          Please enter your Mapbox access token to enable the map functionality.
          You can get one from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter your Mapbox token"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Map Container */}
      <div className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden shadow-inner">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Radius Control */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="mr-1 h-4 w-4 text-primary" />
              <span>Radius</span>
            </div>
            <span className="text-sm font-medium">{radiusInKm} km</span>
          </div>
          <Slider
            value={[radiusInKm]}
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => setRadiusInKm(value[0])}
          />
        </div>
      </div>
      
      {/* User Details & Request Panel */}
      {selectedUser && (
        <Card className="mt-4 shadow-md animate-slide-in-bottom">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <UserCard 
                user={nearbyUsers.find(u => u.id === selectedUser)!} 
                minimal={true}
              />
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-primary" />
                    Meet for:
                  </h4>
                </div>
                <div className="flex space-x-2 mb-4">
                  {availableTimes.map(time => (
                    <Button
                      key={time}
                      variant={selectedDuration === time ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setSelectedDuration(time)}
                    >
                      {time} min
                    </Button>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedUser(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleSendRequest}
                  >
                    Send Request
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FriendMap;

