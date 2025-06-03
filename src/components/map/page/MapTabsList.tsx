
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users } from 'lucide-react';

interface MapTabsListProps {
  usersWithLocation: number;
  totalUsers: number;
  filteredUsersCount: number; // Add this new prop for activity-filtered users
}

const MapTabsList: React.FC<MapTabsListProps> = ({ usersWithLocation, totalUsers, filteredUsersCount }) => {
  return (
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="map" className="flex items-center gap-2">
        <MapPin className="h-4 w-4" /> Map View ({usersWithLocation})
      </TabsTrigger>
      <TabsTrigger value="list" className="flex items-center gap-2">
        <Users className="h-4 w-4" /> List View ({filteredUsersCount})
      </TabsTrigger>
    </TabsList>
  );
};

export default MapTabsList;
