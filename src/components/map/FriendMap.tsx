
import React from 'react';
import 'ol/ol.css';
import FriendMapContainer from './FriendMapContainer';
import { useUserPresence } from '@/hooks/useUserPresence';

interface FriendMapProps {
  isManualMode: boolean;
  isTracking: boolean;
  isPrivacyModeEnabled: boolean;
}

const FriendMap: React.FC<FriendMapProps> = ({ 
  isManualMode, 
  isTracking, 
  isPrivacyModeEnabled 
}) => {
  // Enable real-time user presence tracking
  useUserPresence();
  
  return (
    <FriendMapContainer 
      isManualMode={isManualMode}
      isTracking={isTracking}
      isPrivacyModeEnabled={isPrivacyModeEnabled}
    />
  );
};

export default FriendMap;
