
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

export const useMarkerStyles = (
  selectedUser: string | null,
  movingUsers: Set<string>,
  completedMoves: Set<string>
) => {
  // Create marker style based on feature properties
  const getMarkerStyle = (feature: Feature<Geometry>) => {
    const isMoving = movingUsers.has(feature.get('userId'));
    const isUser = feature.get('isCurrentUser');
    const hasMoved = completedMoves.has(feature.get('userId'));
    
    return new Style({
      image: new CircleStyle({
        radius: isUser ? 10 : 8,
        fill: new Fill({ 
          color: isUser ? '#0ea5e9' : 
                 isMoving ? '#10b981' :
                 hasMoved ? '#10b981' :
                 selectedUser === feature.get('userId') ? '#6366f1' : '#6366f1' 
        }),
        stroke: new Stroke({ 
          color: isUser ? '#0369a1' : 'white', 
          width: isUser ? 3 : 2 
        })
      }),
      text: new Text({
        text: feature.get('name'),
        offsetY: -15,
        fill: new Fill({ color: '#374151' }),
        stroke: new Stroke({ color: 'white', width: 2 })
      })
    });
  };

  return { getMarkerStyle };
};
