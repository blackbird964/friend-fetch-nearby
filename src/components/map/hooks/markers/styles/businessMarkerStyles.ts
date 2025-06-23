
import { Style, Icon } from 'ol/style';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { createStarIcon } from './starIconUtils';

export const createBusinessMarkerStyle = (
  feature: Feature<Geometry>,
  selectedUser: string | null,
  movingUsers: Set<string>,
  completedMoves: Set<string>
) => {
  const userId = feature.get('userId');
  const isMoving = movingUsers.has(userId);
  const isUser = feature.get('isCurrentUser');
  const hasMoved = completedMoves.has(userId);
  const businessName = feature.get('businessName') || feature.get('name');
  
  console.log(`⭐ [BusinessMarker] Creating business star for: ${businessName} (userId: ${userId})`);
  
  // Determine marker color based on status
  let markerColor = '#f59e0b'; // Golden/orange color for businesses
  
  if (isUser) {
    markerColor = '#0ea5e9'; // Blue for current user business
  } else if (isMoving || hasMoved) {
    markerColor = '#10b981'; // Green for moving/completed business users
  } else if (selectedUser === userId) {
    markerColor = '#8b5cf6'; // Purple for selected business users
  }
  
  console.log(`⭐ [BusinessMarker] Using color ${markerColor} for business: ${businessName}`);
  
  const style = new Style({
    image: new Icon({
      src: createStarIcon(markerColor),
      scale: 1.4, // Make business markers very prominent
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction'
    })
  });
  
  console.log(`⭐ [BusinessMarker] Created star style for: ${businessName}`);
  return style;
};
