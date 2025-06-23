
import { useEffect } from 'react';
import { Style, Stroke } from 'ol/style';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { FriendRequest } from '@/context/types';

export const useMapStyles = (
  vectorLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>,
  routeLayer: React.MutableRefObject<VectorLayer<VectorSource> | null>,
  getMarkerStyle: (feature: any, resolution?: number) => Style,
  selectedUser: string | null,
  movingUsers: Set<string>,
  completedMoves: Set<string>,
  friendRequests: FriendRequest[]
) => {
  // Set up marker styles
  useEffect(() => {
    if (vectorLayer.current) {
      vectorLayer.current.setStyle((feature: any, resolution: number) => {
        return getMarkerStyle(feature, resolution);
      });
    }
    
    if (routeLayer.current) {
      routeLayer.current.setStyle(new Style({
        stroke: new Stroke({
          color: '#10b981',
          width: 2,
          lineDash: [5, 5]
        })
      }));
    }
  }, [selectedUser, movingUsers, completedMoves, friendRequests, getMarkerStyle, vectorLayer, routeLayer]);
};
