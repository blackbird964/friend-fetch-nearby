
import React from 'react';
import 'ol/ol.css';
import FriendMapContainer from './FriendMapContainer';
import { useUserPresence } from '@/hooks/useUserPresence';

const FriendMap: React.FC = () => {
  // Enable real-time user presence tracking
  useUserPresence();
  
  return <FriendMapContainer />;
};

export default FriendMap;
