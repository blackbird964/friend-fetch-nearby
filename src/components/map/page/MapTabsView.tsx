
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import FriendMap from '@/components/map/FriendMap';

interface MapTabsViewProps {
  isManualMode: boolean;
  isTracking: boolean;
  isPrivacyModeEnabled: boolean;
}

const MapTabsView: React.FC<MapTabsViewProps> = ({ 
  isManualMode, 
  isTracking, 
  isPrivacyModeEnabled 
}) => {
  return (
    <TabsContent value="map" className="pt-4">
      <div className="h-[calc(100vh-300px)] bg-white rounded-lg shadow-md overflow-hidden">
        <FriendMap 
          isManualMode={isManualMode}
          isTracking={isTracking}
          isPrivacyModeEnabled={isPrivacyModeEnabled}
        />
      </div>
    </TabsContent>
  );
};

export default MapTabsView;
