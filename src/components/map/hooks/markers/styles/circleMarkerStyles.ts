
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

export const createCircleMarkerStyles = (feature: Feature<Geometry>) => {
  const circleType = feature.get('circleType');
  const userName = feature.get('name');
  
  if (circleType === 'radius') {
    return new Style({
      stroke: new Stroke({
        color: 'rgba(64, 99, 255, 0.5)', // Semi-transparent blue
        width: 2,
        lineDash: [5, 5]
      }),
      fill: new Fill({
        color: 'rgba(64, 99, 255, 0.05)' // Very light blue fill
      })
    });
  } else if (circleType === 'privacy') {
    // Privacy circle style with purple color
    return new Style({
      stroke: new Stroke({
        color: 'rgba(155, 135, 245, 0.8)', // Purple color for privacy
        width: 2
      }),
      fill: new Fill({
        color: 'rgba(155, 135, 245, 0.3)' // This opacity will be animated
      }),
      text: userName ? new Text({
        text: userName,
        offsetY: -20,
        fill: new Fill({ color: '#374151' }),
        stroke: new Stroke({ color: 'white', width: 2 })
      }) : undefined
    });
  }
  
  return null;
};

export const createHeatmapMarkerStyle = () => {
  return new Style({
    image: new CircleStyle({
      radius: 120, // 10 times larger than normal marker (12px)
      fill: new Fill({ color: 'rgba(155, 135, 245, 0.2)' }), // Semi-transparent purple
      stroke: new Stroke({ color: 'rgba(155, 135, 245, 0.4)', width: 1 })
    }),
    zIndex: 5 // Ensure it appears below the actual marker
  });
};
