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
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const vectorSource = useRef<VectorSource | null>(null);
  const vectorLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const routeLayer = useRef<VectorLayer<VectorSource> | null>(null);

  const WYNYARD_COORDS = [151.2073, -33.8666];

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
        return new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({ 
              color: isUser ? '#0ea5e9' : 
                     isMoving ? '#10b981' :
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
      const feature = map.current?.forEachFeatureAtPixel(event.pixel, (f) => f);
      if (feature) {
        const userId = feature.get('userId');
        if (userId && !movingUsers.has(userId)) {
          setSelectedUser(userId);
        }
      }
    });

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
      }
    };
  }, [selectedUser, movingUsers]);

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
      { lat: -33.8736, lng: 151.2014, name: "Emma R." }   // Darling Harbour
    ];

    sydneyLocations.forEach((loc, index) => {
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
  }, [nearbyUsers, mapLoaded]);

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
      
      // Animate marker
      let progress = 0;
      const animate = () => {
        progress += 0.005;
        if (progress <= 1) {
          const currentCoord = [
            startCoord[0] + (endCoord[0] - startCoord[0]) * progress,
            startCoord[1] + (endCoord[1] - startCoord[1]) * progress
          ];
          userFeature.setGeometry(new Point(currentCoord));
          requestAnimationFrame(animate);
        } else {
          routeLayer.current?.getSource()?.clear();
          setMovingUsers(prev => {
            const next = new Set(prev);
            next.delete(user.id);
            return next;
          });
        }
      };
      animate();
    }

    toast({
      title: "Starting catch up!",
      description: `${user.name} is heading to meet you at Wynyard.`,
    });
    
    setSelectedUser(null);
  };

  const availableTimes = [15, 30, 45];

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
            max={10}
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
