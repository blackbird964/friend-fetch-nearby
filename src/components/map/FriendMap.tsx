import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { User, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import UserCard from '@/components/users/UserCard';
import { useToast } from "@/components/ui/use-toast";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, transform } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle, Fill, Stroke, Text } from 'ol/style';
import LineString from 'ol/geom/LineString';

const FriendMap: React.FC = () => {
  const { currentUser, nearbyUsers, radiusInKm, setRadiusInKm, friendRequests, setFriendRequests } = useAppContext();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();
  const [movingUsers, setMovingUsers] = useState<Set<string>>(new Set());
  const [completedMoves, setCompletedMoves] = useState<Set<string>>(new Set());
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const vectorSource = useRef<VectorSource | null>(null);
  const vectorLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const routeLayer = useRef<VectorLayer<VectorSource> | null>(null);

  const WYNYARD_COORDS = [151.2073, -33.8666];
  const ANIMATION_DURATION = 3000; // 3 seconds total
  const ANIMATION_STEPS = 60; // 60 frames per second * 3 seconds

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Create vector sources and layers
    vectorSource.current = new VectorSource();
    const routeSource = new VectorSource();
    
    vectorLayer.current = new VectorLayer({
      source: vectorSource.current,
      style: (feature) => {
        const isMoving = movingUsers.has(feature.get('userId'));
        const isUser = feature.get('isCurrentUser');
        const hasMoved = completedMoves.has(feature.get('userId'));
        return new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({ 
              color: isUser ? '#0ea5e9' : 
                     isMoving ? '#10b981' :
                     hasMoved ? '#10b981' :
                     selectedUser === feature.get('userId') ? '#6366f1' : '#6366f1' 
            }),
            stroke: new Stroke({ color: 'white', width: 2 })
          }),
          text: new Text({
            text: feature.get('name'),
            offsetY: -15,
            fill: new Fill({ color: '#374151' }),
            stroke: new Stroke({ color: 'white', width: 2 })
          })
        });
      }
    });

    routeLayer.current = new VectorLayer({
      source: routeSource,
      style: new Style({
        stroke: new Stroke({
          color: '#10b981',
          width: 2,
          lineDash: [5, 5]
        })
      })
    });

    map.current = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        routeLayer.current,
        vectorLayer.current
      ],
      view: new View({
        center: fromLonLat(WYNYARD_COORDS),
        zoom: 14
      })
    });

    setMapLoaded(true);

    // Add current user marker at Wynyard
    const userFeature = new Feature({
      geometry: new Point(fromLonLat(WYNYARD_COORDS)),
      isCurrentUser: true,
      name: 'You'
    });
    vectorSource.current.addFeature(userFeature);

    // Add click handler for markers
    map.current.on('click', (event) => {
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
    });

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
      }
    };
  }, [selectedUser, movingUsers, completedMoves]);

  useEffect(() => {
    if (!mapLoaded || !vectorSource.current) return;

    // Clear existing user markers
    const features = vectorSource.current.getFeatures();
    features.forEach(feature => {
      if (!feature.get('isCurrentUser')) {
        vectorSource.current?.removeFeature(feature);
      }
    });

    // Add markers for nearby users with realistic Sydney locations
    const sydneyLocations = [
      { lat: -33.8688, lng: 151.2093, name: "Sarah J." }, // Town Hall
      { lat: -33.8568, lng: 151.2153, name: "David L." }, // The Rocks
      { lat: -33.8736, lng: 151.2014, name: "Emma R." },   // Darling Harbour
      { lat: -33.9509, lng: 151.1825, name: "Michael K." }, // Bankstown
      { lat: -33.7480, lng: 151.2414, name: "Jessica M." }, // Chatswood
      { lat: -33.8914, lng: 151.2766, name: "Thomas W." }, // Bondi
      { lat: -33.7281, lng: 150.9686, name: "Lisa T." }, // Blacktown
      { lat: -33.9657, lng: 150.8444, name: "Daniel H." } // Liverpool
    ];

    // Filter locations based on radius
    const filteredLocations = sydneyLocations.filter(loc => {
      const distance = calculateDistance(
        -33.8666, // Wynyard lat
        151.2073, // Wynyard lng
        loc.lat,
        loc.lng
      );
      return distance <= radiusInKm;
    });

    filteredLocations.forEach((loc, index) => {
      const user = nearbyUsers[index];
      if (user) {
        const userFeature = new Feature({
          geometry: new Point(fromLonLat([loc.lng, loc.lat])),
          userId: user.id,
          name: loc.name
        });
        vectorSource.current?.addFeature(userFeature);
      }
    });
    
    // Make sure to refresh the vector layer to update styles for all features
    if (vectorLayer.current) {
      vectorLayer.current.changed();
    }
  }, [nearbyUsers, mapLoaded, radiusInKm]);

  const handleSendRequest = () => {
    if (!selectedUser) return;
    
    const user = nearbyUsers.find(u => u.id === selectedUser);
    if (!user) return;
    
    setMovingUsers(prev => new Set(prev).add(user.id));
    
    // Simulate user moving to meeting point
    const userFeature = vectorSource.current?.getFeatures().find(f => f.get('userId') === user.id);
    if (userFeature && routeLayer.current?.getSource()) {
      const startCoord = (userFeature.getGeometry() as Point).getCoordinates();
      const endCoord = fromLonLat(WYNYARD_COORDS);
      
      // Add route line
      const routeFeature = new Feature({
        geometry: new LineString([startCoord, endCoord])
      });
      routeLayer.current.getSource()?.addFeature(routeFeature);
      
      let startTime: number | null = null;
      
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
        
        // Add bounce effect
        const bounce = Math.sin(progress * Math.PI * 8) * 0.0001;
        
        const currentCoord = [
          startCoord[0] + (endCoord[0] - startCoord[0]) * progress,
          startCoord[1] + (endCoord[1] - startCoord[1]) * progress + bounce
        ];
        
        userFeature.setGeometry(new Point(currentCoord));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCompletedMoves(prev => {
            const next = new Set(prev);
            next.add(user.id);
            return next;
          });
          
          setMovingUsers(prev => {
            const next = new Set(prev);
            next.delete(user.id);
            return next;
          });
          
          // Keep marker at final position
          userFeature.setGeometry(new Point(endCoord));
          
          // Clear route line after delay
          setTimeout(() => {
            routeLayer.current?.getSource()?.clear();
          }, 1000);

          // Show confirmation toast with selected duration
          toast({
            title: "Catch up confirmed!",
            description: `Meeting ${user.name} at Wynyard for ${selectedDuration} minutes.`,
          });
        }
      };
      
      requestAnimationFrame(animate);
    }

    setSelectedUser(null);
  };

  const availableTimes = [15, 30, 45, 60];

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden shadow-inner">
        <div ref={mapContainer} className="absolute inset-0" />
        
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
            max={60}
            step={1}
            onValueChange={(value) => setRadiusInKm(value[0])}
          />
        </div>
      </div>
      
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
