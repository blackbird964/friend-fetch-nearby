
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

export const createClusterMarkerStyle = (feature: Feature<Geometry>, resolution?: number) => {
  const clusterSize = feature.get('clusterSize') || 1;
  const isBusiness = feature.get('isBusiness');
  
  // Calculate radius based on resolution to maintain consistent geographic size
  // This ensures the marker represents approximately 2km regardless of zoom level
  const baseRadiusMeters = 2000; // 2km in meters
  const pixelRadius = resolution ? Math.max(15, Math.min(40, baseRadiusMeters / resolution)) : 20;
  
  // For single users that got put in a cluster (edge case)
  if (clusterSize === 1) {
    return new Style({
      image: new CircleStyle({
        radius: pixelRadius,
        fill: new Fill({ 
          color: isBusiness ? '#10b981' : '#6366f1' // Green for business, purple for regular
        }),
        stroke: new Stroke({ 
          color: 'white', 
          width: 2 
        })
      })
    });
  }
  
  // Use consistent radius for all cluster markers
  const radius = pixelRadius;
  const color = isBusiness ? '#10b981' : '#6366f1'; // Green for business, purple for regular
  
  return new Style({
    image: new CircleStyle({
      radius: radius,
      fill: new Fill({ 
        color: color + '80' // Semi-transparent
      }),
      stroke: new Stroke({ 
        color: color, 
        width: 3 
      })
    }),
    text: new Text({
      text: clusterSize.toString(),
      fill: new Fill({ color: 'white' }),
      font: 'bold 16px Arial',
      stroke: new Stroke({ 
        color: color, 
        width: 2 
      })
    })
  });
};
