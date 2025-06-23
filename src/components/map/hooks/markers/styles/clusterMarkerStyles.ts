
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

export const createClusterMarkerStyle = (feature: Feature<Geometry>) => {
  const clusterSize = feature.get('clusterSize') || 1;
  const isBusiness = feature.get('isBusiness');
  
  // For single users that got put in a cluster (edge case)
  if (clusterSize === 1) {
    // Use a fixed size circle for single users - represents ~2km radius
    return new Style({
      image: new CircleStyle({
        radius: 20, // Fixed size regardless of zoom
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
  
  // Fixed radius that represents approximately 2km on the map
  // This size stays constant regardless of zoom level
  const radius = 30; // Fixed 30px radius for all cluster markers
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
      font: 'bold 16px Arial', // Slightly larger font for better visibility
      stroke: new Stroke({ 
        color: color, 
        width: 2 
      })
    })
  });
};
