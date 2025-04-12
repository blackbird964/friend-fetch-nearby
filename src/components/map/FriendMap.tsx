
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { MapPin, User, Clock, MapPinOff } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import UserCard from '@/components/users/UserCard';
import { useToast } from "@/components/ui/use-toast";

// Mock Map component for now - in a real app, you'd use a proper map like Google Maps or Mapbox
const FriendMap: React.FC = () => {
  const { currentUser, nearbyUsers, radiusInKm, setRadiusInKm, friendRequests, setFriendRequests } = useAppContext();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const { toast } = useToast();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
    
    // In a real app, this would be sent to a server
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
        {/* Simulated Map */}
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#e8f4f8]">
            {/* Current User Location */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="absolute -inset-8 rounded-full bg-primary/20 pulse-animation"></div>
                <div className="relative z-10 bg-primary text-white rounded-full p-2">
                  <User size={24} />
                </div>
              </div>
            </div>
            
            {/* Nearby Users */}
            {nearbyUsers.map((user, index) => {
              // Calculate random positions around the center
              const angle = (index / nearbyUsers.length) * 2 * Math.PI;
              const distance = Math.random() * 30 + 15; // 15-45% from center
              const top = 50 + Math.sin(angle) * distance;
              const left = 50 + Math.cos(angle) * distance;
              
              return (
                <button
                  key={user.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    selectedUser === user.id ? 'scale-110 z-10' : 'hover:scale-105'
                  }`}
                  style={{ top: `${top}%`, left: `${left}%` }}
                  onClick={() => setSelectedUser(user.id === selectedUser ? null : user.id)}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg">
                      <img 
                        src={user.profile_pic || ''} 
                        alt={user.name || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedUser === user.id && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 shadow-lg">
                        <MapPin size={10} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            
            {/* Radius Indicator */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-primary/30 rounded-full"
              style={{ 
                width: `${radiusInKm * 8}%`, 
                height: `${radiusInKm * 8}%`,
                minWidth: '30%',
                minHeight: '30%',
              }}
            ></div>
          </div>
        )}
        
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
