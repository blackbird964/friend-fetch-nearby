
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

export const createCircleMarkerStyles = (feature: Feature<Geometry>) => {
  const circleType = feature.get('circleType');
  
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
    // Privacy circle style with purple color - removed text
    return new Style({
      stroke: new Stroke({
        color: 'rgba(155, 135, 245, 0.8)', // Purple color for privacy
        width: 2
      }),
      fill: new Fill({
        color: 'rgba(155, 135, 245, 0.3)' // This opacity will be animated
      })
      // Removed text property to clean up markers
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
