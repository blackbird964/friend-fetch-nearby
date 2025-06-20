
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
  
  // Determine marker color based on status
  let markerColor = '#6366f1'; // Default purple color
  
  if (isUser) {
    markerColor = '#0ea5e9'; // Blue for current user
  } else if (isMoving || hasMoved) {
    markerColor = '#10b981'; // Green for moving/completed users
  } else if (selectedUser === userId) {
    markerColor = '#6366f1'; // Purple for selected users
  }
  
  return new Style({
    image: new Icon({
      src: createStarIcon(markerColor),
      scale: 1,
      anchor: [0.5, 0.5]
    })
    // Removed text property to clean up markers
  });
};
