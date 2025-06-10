
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

export const useClusterMarkerStyles = () => {
  const getClusterMarkerStyle = (feature: Feature<Geometry>) => {
    const isCluster = feature.get('isCluster');
    const clusterSize = feature.get('clusterSize') || 1;
    const name = feature.get('name') || '';
    
    if (isCluster && clusterSize > 1) {
      // Cluster marker style - size based on number of users
      const baseRadius = 15;
      const maxRadius = 35;
      const radius = Math.min(baseRadius + (clusterSize * 2), maxRadius);
      
      // Color intensity based on cluster size
      const intensity = Math.min(clusterSize / 20, 1);
      const red = Math.floor(100 + (155 * intensity));
      const green = Math.floor(100 + (55 * (1 - intensity)));
      const blue = Math.floor(150 + (105 * (1 - intensity)));
      
      return new Style({
        image: new CircleStyle({
          radius: radius,
          fill: new Fill({ 
            color: `rgba(${red}, ${green}, ${blue}, 0.7)` 
          }),
          stroke: new Stroke({ 
            color: 'white', 
            width: 3 
          })
        }),
        text: new Text({
          text: clusterSize.toString(),
          fill: new Fill({ color: 'white' }),
          stroke: new Stroke({ color: 'rgba(0,0,0,0.5)', width: 1 }),
          font: 'bold 12px Arial',
          offsetY: 0
        })
      });
    }
    
    // Regular marker style for individual users
    return new Style({
      image: new CircleStyle({
        radius: 12,
        fill: new Fill({ color: '#6366f1' }),
        stroke: new Stroke({ color: 'white', width: 2 })
      }),
      text: new Text({
        text: name,
        offsetY: -20,
        fill: new Fill({ color: '#374151' }),
        stroke: new Stroke({ color: 'white', width: 2 })
      })
    });
  };
  
  return { getClusterMarkerStyle };
};
