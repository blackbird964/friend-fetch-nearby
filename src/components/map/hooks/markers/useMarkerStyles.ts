
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
    const isCluster = feature.get('isCluster');
    const clusterSize = feature.get('clusterSize') || 1;
    
    // Debug logging for business detection
    console.log(`[MarkerStyle] Processing feature: userId=${userId}, isBusiness=${isBusiness}, businessName=${businessName}, isCluster=${isCluster}`);
    
    // Special style for heatmap marker (privacy mode)
    if (isHeatMap) {
      console.log(`[MarkerStyle] Creating heatmap style for userId: ${userId}`);
      return createHeatmapMarkerStyle();
    }
    
    // Special styles for radius or privacy circles
    if (isCircle) {
      console.log(`[MarkerStyle] Creating circle style for userId: ${userId}`);
      return createCircleMarkerStyles(feature);
    }
    
    // CRITICAL: Business users get star icons - this MUST take absolute priority
    if (isBusiness === true) {
      console.log(`⭐ [MarkerStyle] Creating BUSINESS STAR for: ${businessName} (userId: ${userId})`);
      return createBusinessMarkerStyle(feature, selectedUser, movingUsers, completedMoves);
    }
    
    // Handle cluster markers (only for non-business users)
    if (isCluster && clusterSize > 1 && !isBusiness) {
      console.log(`[MarkerStyle] Creating cluster style for ${clusterSize} users`);
      return createClusterMarkerStyle(feature);
    }
    
    // Regular user markers (non-business, non-cluster)
    console.log(`[MarkerStyle] Creating regular user style for userId: ${userId}`);
    return createUserMarkerStyle(feature, selectedUser, movingUsers, completedMoves, friendRequests);
  };

  return { getMarkerStyle };
};
