import { useEffect, useRef, useCallback } from 'react';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import { Style, Stroke, Fill } from 'ol/style';
import Map from 'ol/Map';
import { AppUser } from '@/context/types';

export const useRadiusCircle = (
  map: React.MutableRefObject<Map | null>,
  vectorSource: React.MutableRefObject<VectorSource | null>,
  currentUser: AppUser | null,
  radiusInKm: number
) => {
  const radiusLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const radiusFeature = useRef<Feature | null>(null);

  // Create a separate layer for the radius circle to improve performance
  useEffect(() => {
    if (!map.current) return;

    // Clean up existing layer if it exists
    if (radiusLayer.current) {
      map.current.removeLayer(radiusLayer.current);
      radiusLayer.current = null;
    }

    // Create the radius layer with appropriate styling
    const source = new VectorSource();
    radiusLayer.current = new VectorLayer({
      source,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(64, 99, 255, 0.5)',
          width: 2,
          lineDash: [5, 5]
        }),
        fill: new Fill({
          color: 'rgba(64, 99, 255, 0.05)'
        })
      }),
      zIndex: 9, // Below user markers
    });

    map.current.addLayer(radiusLayer.current);

    return () => {
      if (map.current && radiusLayer.current) {
        map.current.removeLayer(radiusLayer.current);
        radiusLayer.current = null;
      }
    };
  }, [map]);

  // Separated update function to avoid recreation in effects
  const updateRadiusCircle = useCallback(() => {
    if (!radiusLayer.current || !map.current || !currentUser?.location) return;

    const { lng, lat } = currentUser.location;
    const center = fromLonLat([lng, lat]);
    const radiusInMeters = radiusInKm * 1000; // Convert km to meters

    const source = radiusLayer.current.getSource();
    source.clear(); // Clear existing feature

    radiusFeature.current = new Feature({
      geometry: new Circle(center, radiusInMeters),
      name: 'radiusCircle',
      isCircle: true,
      circleType: 'radius',
    });

    source.addFeature(radiusFeature.current);
  }, [currentUser?.location, radiusInKm, map]);

  // Update radius circle when user location or radius changes
  useEffect(() => {
    if (!currentUser || !map.current || !radiusLayer.current) return;

    updateRadiusCircle();

    // Maintain circle size on zoom changes
    const view = map.current.getView();

    // Don't recreate this function on every render
    const fixCircleOnZoomChange = () => {
      updateRadiusCircle();
    };

    view.on('change:resolution', fixCircleOnZoomChange);

    // Cleanup zoom listener
    return () => {
      view.un('change:resolution', fixCircleOnZoomChange);
    };
  }, [currentUser?.location, radiusInKm, map, updateRadiusCircle]);

  return { radiusLayer, radiusFeature };
};
