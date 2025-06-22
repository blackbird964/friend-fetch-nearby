
import React from 'react';
import 'ol/ol.css';
import FriendMapContainer from './FriendMapContainer';

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
  return (
    <FriendMapContainer 
      isManualMode={isManualMode}
      isTracking={isTracking}
      isPrivacyModeEnabled={isPrivacyModeEnabled}
    />
  );
};

export default FriendMap;
