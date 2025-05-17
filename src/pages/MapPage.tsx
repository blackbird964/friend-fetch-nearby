
import React, { useEffect, useState } from 'react';
import FriendMap from '@/components/map/FriendMap';
import UserList from '@/components/users/UserList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, RefreshCw, Eye, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import LocationPrivacyToggle from '@/components/map/components/LocationPrivacyToggle';

const MapPage: React.FC = () => {
  const { refreshNearbyUsers, loading, currentUser, nearbyUsers, updateUserLocation, setCurrentUser } = useAppContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Add state for manual mode and tracking
  const [isManualMode, setIsManualMode] = useState(() => {
    // Try to get from localStorage for persistence
    const savedManualMode = localStorage.getItem('kairo-manual-mode');
    return savedManualMode === 'true';
  });
  
  const [isTracking, setIsTracking] = useState(() => {
    // Try to get from localStorage for persistence
    const savedTracking = localStorage.getItem('kairo-tracking');
    return savedTracking !== 'false'; // Default to true if not set
  });
  
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState(() => {
    // Try to get from localStorage for persistence
    const savedPrivacy = localStorage.getItem('kairo-privacy-mode');
    if (savedPrivacy !== null) {
      return savedPrivacy === 'true';
    }
    return currentUser?.locationSettings?.hideExactLocation || false;
  });

  // Toggle handlers with local storage persistence
  const toggleManualMode = () => {
    const newValue = !isManualMode;
    setIsManualMode(newValue);
    localStorage.setItem('kairo-manual-mode', String(newValue));
  };
  
  const toggleLocationTracking = () => {
    const newValue = !isTracking;
    setIsTracking(newValue);
    localStorage.setItem('kairo-tracking', String(newValue));
  };
  
  // Privacy mode toggle handler - now directly updates the user's settings
  const togglePrivacyMode = () => {
    const newPrivacyValue = !isPrivacyModeEnabled;
    setIsPrivacyModeEnabled(newPrivacyValue);
    localStorage.setItem('kairo-privacy-mode', String(newPrivacyValue));
    
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        locationSettings: {
          ...currentUser.locationSettings || {},
          hideExactLocation: newPrivacyValue
        }
      };
      
      setCurrentUser(updatedUser);
      
      // Make sure to update in database
      if (currentUser.id && currentUser.location) {
        toast({
          title: newPrivacyValue ? "Privacy Mode Enabled" : "Privacy Mode Disabled",
          description: newPrivacyValue 
            ? "Your exact location is now hidden from others" 
            : "Your exact location is now visible to others",
          duration: 3000,
        });
        
        // Update with current location and new privacy setting
        updateUserLocation(currentUser.id, currentUser.location);
        
        // Dispatch privacy mode change event
        window.dispatchEvent(new CustomEvent('privacy-mode-changed', { 
          detail: { isPrivacyEnabled: newPrivacyValue } 
        }));
      }
    }
  };
  
  // Fetch nearby users on initial load - without toast notification
  useEffect(() => {
    if (currentUser?.location) {
      // Don't show toast for automatic updates
      refreshNearbyUsers(false);
    }
  }, [currentUser?.location, refreshNearbyUsers]);

  // Update privacy mode based on user settings when they change
  useEffect(() => {
    if (currentUser?.locationSettings?.hideExactLocation !== undefined) {
      setIsPrivacyModeEnabled(currentUser.locationSettings.hideExactLocation);
      localStorage.setItem('kairo-privacy-mode', String(currentUser.locationSettings.hideExactLocation));
    }
  }, [currentUser?.locationSettings?.hideExactLocation]);
  
  const handleRefresh = async () => {
    try {
      // Only show toast on manual refresh
      await refreshNearbyUsers(true);
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast({
        title: "Error",
        description: "Failed to refresh nearby users.",
        variant: "destructive"
      });
    }
  };

  // Count users with location for map view
  const usersWithLocation = nearbyUsers.filter(user => user.location).length;
  const totalUsers = nearbyUsers.length;

  return (
    <div className="container mx-auto px-4 py-6 mb-20 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Find Friends Nearby</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="map" className="mb-6">
        <div className="flex flex-col gap-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Map View ({usersWithLocation})
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> List View ({totalUsers})
            </TabsTrigger>
          </TabsList>
          
          {/* Location controls row with updated privacy toggle */}
          <div className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded-md">
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-1">
                <Switch
                  id="manual-mode"
                  checked={isManualMode}
                  onCheckedChange={toggleManualMode}
                  className="scale-75"
                />
                <Label htmlFor="manual-mode" className="text-xs whitespace-nowrap">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Manual
                </Label>
              </div>

              <LocationPrivacyToggle 
                isPrivacyModeEnabled={isPrivacyModeEnabled}
                togglePrivacyMode={togglePrivacyMode}
                showLabel={true}
                small={true}
                variant="switch"
              />
            </div>

            <div className="flex items-center space-x-1">
              <Switch
                id="tracking-mode"
                checked={isTracking}
                onCheckedChange={toggleLocationTracking}
                className="scale-75"
              />
              <Label htmlFor="tracking-mode" className="text-xs whitespace-nowrap">
                <Eye className="h-3 w-3 inline mr-1" />
                Track
              </Label>
            </div>
          </div>
          
          {/* New privacy mode indicator with enhanced styling */}
          {isPrivacyModeEnabled && (
            <div className="flex items-center justify-center py-1 px-2 bg-purple-50 rounded-md text-xs text-purple-700 border border-purple-100 animate-fade-in">
              <Shield className="h-3 w-3 mr-1 inline shield-pulse text-purple-500" />
              Privacy Mode Active - Your exact location is hidden
            </div>
          )}
        </div>
        
        <TabsContent value="map" className="pt-4">
          <div className="h-[calc(100vh-300px)] bg-white rounded-lg shadow-md overflow-hidden">
            <FriendMap 
              isManualMode={isManualMode}
              isTracking={isTracking}
              isPrivacyModeEnabled={isPrivacyModeEnabled}
            />
          </div>
        </TabsContent>
        <TabsContent value="list" className="pt-4">
          <div className="bg-white rounded-lg shadow-md p-4 overflow-auto max-h-[calc(100vh-300px)]">
            <UserList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MapPage;
