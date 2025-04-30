
import React from 'react';
import FriendMap from '@/components/map/FriendMap';
import UserList from '@/components/users/UserList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

const MapPage: React.FC = () => {
  const { refreshNearbyUsers, loading } = useAppContext();
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      await refreshNearbyUsers();
      toast({
        title: "Refreshed",
        description: "Nearby users list has been updated.",
      });
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast({
        title: "Error",
        description: "Failed to refresh nearby users.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 mb-20 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Find Friends Nearby</h1>
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
      
      <Tabs defaultValue="map" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Map View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> List View
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
