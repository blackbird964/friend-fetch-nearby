
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { AppUser } from '@/context/types';
import { calculateDistance } from '@/utils/locationUtils';

export interface ClusterGroup {
  center: { lat: number; lng: number };
  users: AppUser[];
  radius: number;
}

/**
 * Group nearby users into clusters to reduce visual clutter
 */
export const clusterNearbyUsers = (users: AppUser[], clusterRadius: number = 0.5): ClusterGroup[] => {
  const clusters: ClusterGroup[] = [];
  const processedUsers = new Set<string>();
  
  for (const user of users) {
    if (processedUsers.has(user.id) || !user.location) continue;
    
    const cluster: ClusterGroup = {
      center: user.location,
      users: [user],
      radius: clusterRadius
    };
    
    processedUsers.add(user.id);
    
    // Find nearby users to add to this cluster
    for (const otherUser of users) {
      if (processedUsers.has(otherUser.id) || !otherUser.location) continue;
      
      const distance = calculateDistance(
        user.location.lat,
        user.location.lng,
        otherUser.location.lat,
        otherUser.location.lng
      );
      
      if (distance <= clusterRadius) {
        cluster.users.push(otherUser);
        processedUsers.add(otherUser.id);
      }
    }
    
    clusters.push(cluster);
  }
  
  return clusters;
};

/**
 * Create heatmap-style markers for user clusters
 */
export const createClusterMarkers = (
  clusters: ClusterGroup[],
  vectorSource: VectorSource,
  currentUser: AppUser | null
): Feature[] => {
  const features: Feature[] = [];
  
  for (const cluster of clusters) {
    if (cluster.users.length === 1) {
      // Single user - create normal marker
      const user = cluster.users[0];
      const feature = new Feature({
        geometry: new Point(fromLonLat([user.location!.lng, user.location!.lat])),
        userId: user.id,
        name: user.name || `User-${user.id.substring(0, 4)}`,
        isCluster: false,
        clusterSize: 1
      });
      features.push(feature);
    } else {
      // Multiple users - create cluster marker
      const centerLat = cluster.users.reduce((sum, u) => sum + u.location!.lat, 0) / cluster.users.length;
      const centerLng = cluster.users.reduce((sum, u) => sum + u.location!.lng, 0) / cluster.users.length;
      
      const feature = new Feature({
        geometry: new Point(fromLonLat([centerLng, centerLat])),
        isCluster: true,
        clusterSize: cluster.users.length,
        clusterUsers: cluster.users,
        name: `${cluster.users.length} users nearby`
      });
      features.push(feature);
    }
  }
  
  return features;
};
