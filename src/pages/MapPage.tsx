import React, { useEffect } from 'react';
import FriendMap from '@/components/map/FriendMap';
import UserList from '@/components/users/UserList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, RefreshCw, Navigation, AlertTriangle, Bug, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

const MapPage: React.FC = () => {
  const { refreshNearbyUsers, loading, currentUser, nearbyUsers } = useAppContext();
  const { toast } = useToast();
  
  // Fetch nearby users on initial load - without toast notification
  useEffect(() => {
    if (currentUser?.location) {
      refreshNearbyUsers(false);
    }
  }, [currentUser?.location]);
  
  const handleRefresh = async () => {
    try {
      // Only show toast when manually refreshing
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
      
      {!currentUser?.location && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm font-medium">Location access required</p>
            <p className="text-amber-700 text-sm">Please enable location access in your browser to see people nearby.</p>
          </div>
        </div>
      )}
      
      {currentUser?.location && (
        <div className="mb-4 text-sm text-gray-600 flex items-center">
          <Navigation className="h-4 w-4 mr-1" />
          <span>Your location: {currentUser.location.lat.toFixed(4)}, {currentUser.location.lng.toFixed(4)}</span>
        </div>
      )}
      
      {/* Debug information */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-800 text-sm font-medium">Debug Information</p>
          <p className="text-blue-700 text-sm">For others to appear on the map, they must also have the app open and share their location.</p>
          <p className="text-blue-700 text-sm">Total users: {totalUsers}, Users with location: {usersWithLocation}</p>
        </div>
      </div>
      
      {totalUsers === 0 && currentUser?.location && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <Bug className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 text-sm font-medium">No users found</p>
            <p className="text-red-700 text-sm">There are no users in the database. Try refreshing or checking your connection.</p>
          </div>
        </div>
      )}
      
      {totalUsers > 0 && usersWithLocation === 0 && currentUser?.location && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
          <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 text-sm font-medium">Finding nearby users</p>
            <p className="text-blue-700 text-sm">Found {totalUsers} users, but none have shared their location yet. Check the List View to see all users.</p>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="list" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Map View ({usersWithLocation})
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> List View ({totalUsers})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="map" className="pt-4">
          <div className="h-[calc(100vh-250px)] bg-white rounded-lg shadow-md overflow-hidden">
            <FriendMap />
          </div>
        </TabsContent>
        <TabsContent value="list" className="pt-4">
          <div className="bg-white rounded-lg shadow-md p-4 overflow-auto max-h-[calc(100vh-250px)]">
            <UserList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MapPage;
