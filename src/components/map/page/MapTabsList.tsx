
import React, { useEffect, useState } from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { getBusinessProfile } from '@/lib/supabase/businessProfiles';

interface MapTabsListProps {
  usersWithLocation: number;
  totalUsers: number;
  filteredUsersCount: number; // Add this new prop for activity-filtered users
}

const MapTabsList: React.FC<MapTabsListProps> = ({ usersWithLocation, totalUsers, filteredUsersCount }) => {
  const { currentUser } = useAppContext();
  const [isBusinessUser, setIsBusinessUser] = useState<boolean | null>(null);
  
  // Check if current user is a business user
  useEffect(() => {
    const checkBusinessUser = async () => {
      if (currentUser) {
        try {
          const businessProfile = await getBusinessProfile(currentUser.id);
          setIsBusinessUser(!!businessProfile);
        } catch (error) {
          console.error('Error checking business profile:', error);
          setIsBusinessUser(false);
        }
      }
    };
    
    checkBusinessUser();
  }, [currentUser]);

  // For business users, show 0 on map view since they can't see markers
  const mapViewCount = isBusinessUser ? 0 : usersWithLocation;
  
  return (
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="map" className="flex items-center gap-2">
        <MapPin className="h-4 w-4" /> Map View ({mapViewCount})
      </TabsTrigger>
      <TabsTrigger value="list" className="flex items-center gap-2">
        <Users className="h-4 w-4" /> {isBusinessUser ? 'Count' : 'List'} View ({filteredUsersCount})
      </TabsTrigger>
    </TabsList>
  );
};

export default MapTabsList;
