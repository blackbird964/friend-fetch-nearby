
import { Style } from 'ol/style';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { FriendRequest } from '@/context/types';
import { createBusinessMarkerStyle } from './styles/businessMarkerStyles';
import { createClusterMarkerStyle } from './styles/clusterMarkerStyles';
import { createCircleMarkerStyles, createHeatmapMarkerStyle } from './styles/circleMarkerStyles';
import { createUserMarkerStyle } from './styles/userMarkerStyles';

export const useMarkerStyles = (
  selectedUser: string | null,
  movingUsers: Set<string>,
  completedMoves: Set<string>,
  friendRequests: FriendRequest[]
) => {
  // Create marker style based on feature properties
  const getMarkerStyle = (feature: Feature<Geometry>) => {
    const userId = feature.get('userId');
    const isCircle = feature.get('isCircle');
    const isHeatMap = feature.get('isHeatMap');
    const isBusiness = feature.get('isBusiness');
    const businessName = feature.get('businessName') || feature.get('name');
    
    // Log business detection for debugging
    if (isBusiness) {
      console.log(`Detected business marker: ${businessName} (userId: ${userId})`);
    }
    
    // Handle cluster markers FIRST, but check if it's a business user cluster
    const isCluster = feature.get('isCluster');
    const clusterSize = feature.get('clusterSize') || 1;
    
    // For business users, ALWAYS use star icon regardless of cluster
    if (isBusiness) {
      console.log(`Applying business star style for: ${businessName}`);
      return createBusinessMarkerStyle(feature, selectedUser, movingUsers, completedMoves);
    }
    
    if (isCluster && clusterSize > 1) {
      return createClusterMarkerStyle(feature);
    }
    
    // Special style for heatmap marker (privacy mode)
    if (isHeatMap) {
      return createHeatmapMarkerStyle();
    }
    
    // Special styles for radius or privacy circles
    if (isCircle) {
      return createCircleMarkerStyles(feature);
    }
    
    // Regular user markers
    return createUserMarkerStyle(feature, selectedUser, movingUsers, completedMoves, friendRequests);
  };

  return { getMarkerStyle };
};
