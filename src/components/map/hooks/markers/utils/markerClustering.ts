
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
 * Calculate dynamic cluster radius based on user distribution and density
 */
const calculateDynamicClusterRadius = (users: AppUser[], baseRadius: number = 0.5): number => {
  if (users.length < 10) return baseRadius;
  
  // Filter users with valid locations
  const usersWithLocation = users.filter(u => u.location);
  if (usersWithLocation.length === 0) return baseRadius;
  
  // Calculate the geographic spread of users
  const lats = usersWithLocation.map(u => u.location!.lat);
  const lngs = usersWithLocation.map(u => u.location!.lng);
  
  const latRange = Math.max(...lats) - Math.min(...lats);
  const lngRange = Math.max(...lngs) - Math.min(...lngs);
  
  // Calculate average distance between all users
  let totalDistance = 0;
  let distanceCount = 0;
  
  for (let i = 0; i < usersWithLocation.length - 1; i++) {
    for (let j = i + 1; j < usersWithLocation.length; j++) {
      totalDistance += calculateDistance(
        usersWithLocation[i].location!.lat,
        usersWithLocation[i].location!.lng,
        usersWithLocation[j].location!.lat,
        usersWithLocation[j].location!.lng
      );
      distanceCount++;
    }
  }
  
  const avgDistance = distanceCount > 0 ? totalDistance / distanceCount : baseRadius;
  
  // Scale cluster radius based on user density and geographic spread
  const geographicSpread = Math.max(latRange, lngRange);
  const density = usersWithLocation.length / Math.max(geographicSpread, 0.01);
  
  // Adaptive radius: larger radius for sparse distributions, smaller for dense
  let adaptiveRadius = baseRadius;
  
  if (density > 50) {
    // Very dense - use smaller clusters
    adaptiveRadius = Math.max(0.2, baseRadius * 0.6);
  } else if (density > 20) {
    // Moderately dense - use medium clusters
    adaptiveRadius = baseRadius * 0.8;
  } else if (density < 5) {
    // Sparse - use larger clusters to group distant users
    adaptiveRadius = Math.min(2.0, baseRadius * 1.5);
  }
  
  console.log(`Dynamic clustering: ${usersWithLocation.length} users, density: ${density.toFixed(2)}, radius: ${adaptiveRadius.toFixed(2)}km`);
  
  return adaptiveRadius;
};

/**
 * Group nearby users into clusters to reduce visual clutter with improved algorithm
 */
export const clusterNearbyUsers = (users: AppUser[], baseClusterRadius: number = 0.5): ClusterGroup[] => {
  if (users.length === 0) return [];
  
  const clusters: ClusterGroup[] = [];
  const processedUsers = new Set<string>();
  
  // Filter users with valid locations
  const usersWithLocation = users.filter(u => u.location);
  
  // Calculate dynamic cluster radius
  const clusterRadius = calculateDynamicClusterRadius(usersWithLocation, baseClusterRadius);
  
  // Sort users by density (users with more neighbors get processed first)
  const usersWithNeighborCounts = usersWithLocation.map(user => {
    const neighborCount = usersWithLocation.filter(otherUser => {
      if (otherUser.id === user.id) return false;
      
      const distance = calculateDistance(
        user.location!.lat,
        user.location!.lng,
        otherUser.location!.lat,
        otherUser.location!.lng
      );
      
      return distance <= clusterRadius;
    }).length;
    
    return { user, neighborCount };
  });
  
  // Sort by neighbor count (descending) to process dense areas first
  usersWithNeighborCounts.sort((a, b) => b.neighborCount - a.neighborCount);
  
  for (const { user } of usersWithNeighborCounts) {
    if (processedUsers.has(user.id)) continue;
    
    const cluster: ClusterGroup = {
      center: user.location!,
      users: [user],
      radius: clusterRadius
    };
    
    processedUsers.add(user.id);
    
    // Find all users within cluster radius of this user
    const nearbyUsers = usersWithLocation.filter(otherUser => {
      if (processedUsers.has(otherUser.id)) return false;
      
      const distance = calculateDistance(
        user.location!.lat,
        user.location!.lng,
        otherUser.location!.lat,
        otherUser.location!.lng
      );
      
      return distance <= clusterRadius;
    });
    
    // Add nearby users to cluster
    nearbyUsers.forEach(nearbyUser => {
      cluster.users.push(nearbyUser);
      processedUsers.add(nearbyUser.id);
    });
    
    // Recalculate cluster center as centroid of all users in cluster
    if (cluster.users.length > 1) {
      const totalLat = cluster.users.reduce((sum, u) => sum + u.location!.lat, 0);
      const totalLng = cluster.users.reduce((sum, u) => sum + u.location!.lng, 0);
      
      cluster.center = {
        lat: totalLat / cluster.users.length,
        lng: totalLng / cluster.users.length
      };
    }
    
    clusters.push(cluster);
  }
  
  console.log(`Clustered ${usersWithLocation.length} users into ${clusters.length} clusters`);
  console.log(`Cluster sizes:`, clusters.map(c => c.users.length));
  
  return clusters;
};

/**
 * Create heatmap-style markers for user clusters with improved visibility
 */
export const createClusterMarkers = (
  clusters: ClusterGroup[],
  vectorSource: VectorSource,
  currentUser: AppUser | null
): Feature[] => {
  const features: Feature[] = [];
  
  for (const cluster of clusters) {
    const userCount = cluster.users.length;
    
    if (userCount === 1) {
      // Single user - create normal marker
      const user = cluster.users[0];
      
      const feature = new Feature({
        geometry: new Point(fromLonLat([user.location!.lng, user.location!.lat])),
        userId: user.id,
        name: user.name || `User-${user.id.substring(0, 4)}`,
        isCluster: false,
        clusterSize: 1,
        isBusiness: false // Default to false since we don't have business type info
      });
      features.push(feature);
    } else {
      // Multiple users - create cluster marker
      const feature = new Feature({
        geometry: new Point(fromLonLat([cluster.center.lng, cluster.center.lat])),
        isCluster: true,
        clusterSize: userCount,
        clusterUsers: cluster.users,
        name: `${userCount} users nearby`,
        isBusiness: false // Default to false since we don't have business type info
      });
      features.push(feature);
    }
  }
  
  return features;
};
