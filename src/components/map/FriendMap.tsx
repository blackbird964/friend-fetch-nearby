
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { User, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import UserCard from '@/components/users/UserCard';
import { useToast } from "@/components/ui/use-toast";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle, Fill, Stroke } from 'ol/style';

const FriendMap: React.FC = () => {
  const { currentUser, nearbyUsers, radiusInKm, setRadiusInKm, friendRequests, setFriendRequests } = useAppContext();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const vectorSource = useRef<VectorSource | null>(null);
  const vectorLayer = useRef<VectorLayer<VectorSource> | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Create vector source and layer for markers
    vectorSource.current = new VectorSource();
    vectorLayer.current = new VectorLayer({
      source: vectorSource.current,
      style: new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#0ea5e9' }),
          stroke: new Stroke({ color: 'white', width: 2 })
        })
      })
    });

    // Initialize map
    map.current = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer.current
      ],
      view: new View({
        center: fromLonLat([-74.006, 40.7128]), // Default to NYC
        zoom: 12
      })
    });

    setMapLoaded(true);

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map.current) {
            const userLocation = fromLonLat([position.coords.longitude, position.coords.latitude]);
            map.current.getView().setCenter(userLocation);
            
            // Add marker for current user
            const userFeature = new Feature({
              geometry: new Point(userLocation)
            });
            vectorSource.current?.addFeature(userFeature);
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

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
      }
    };
  }, []);

  // Update markers for nearby users
  useEffect(() => {
    if (!mapLoaded || !vectorSource.current) return;

    // Clear existing markers except current user's marker
    const features = vectorSource.current.getFeatures();
    features.slice(1).forEach(feature => {
      vectorSource.current?.removeFeature(feature);
    });

    // Add markers for nearby users
    nearbyUsers.forEach((user) => {
      if (user.location) {
        const userLocation = fromLonLat([user.location.lng, user.location.lat]);
        const userFeature = new Feature({
          geometry: new Point(userLocation),
          properties: { userId: user.id }
        });
        
        userFeature.setStyle(new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({ color: selectedUser === user.id ? '#10b981' : '#6366f1' }),
            stroke: new Stroke({ color: 'white', width: 2 })
          })
        }));

        vectorSource.current?.addFeature(userFeature);
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

  return (
    <div className="flex flex-col h-full relative">
      {/* Map Container */}
      <div className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden shadow-inner">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Radius Control */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center text-sm text-gray-600">
              <User className="mr-1 h-4 w-4 text-primary" />
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

