
import React from 'react';
import FriendMap from '@/components/map/FriendMap';
import UserList from '@/components/users/UserList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users } from 'lucide-react';

const MapPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 mb-20 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Find Friends Nearby</h1>
      
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
