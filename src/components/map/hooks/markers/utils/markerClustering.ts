
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
 * Calculate dynamic cluster radius based on user distribution and density for large metropolitan areas
 */
const calculateDynamicClusterRadius = (users: AppUser[], baseRadius: number = 0.5): number => {
  if (users.length < 3) return baseRadius;
  
  // Filter users with valid locations
  const usersWithLocation = users.filter(u => u.location?.lat && u.location?.lng);
  if (usersWithLocation.length === 0) return baseRadius;
  
  // Calculate the geographic bounding box
  const lats = usersWithLocation.map(u => u.location!.lat);
  const lngs = usersWithLocation.map(u => u.location!.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Calculate the diagonal distance of the bounding box
  const diagonalDistance = calculateDistance(minLat, minLng, maxLat, maxLng);
  
  // For large metropolitan areas (like Sydney), adapt the clustering strategy
  let adaptiveRadius: number;
  
  if (diagonalDistance > 50) {
    // Very large area (50+ km diagonal) - use larger clusters
    adaptiveRadius = Math.min(3.0, Math.max(1.5, diagonalDistance / 25));
  } else if (diagonalDistance > 20) {
    // Large metropolitan area (20-50 km diagonal) - moderate clusters  
    adaptiveRadius = Math.min(2.0, Math.max(1.0, diagonalDistance / 20));
  } else if (diagonalDistance > 10) {
    // Medium area (10-20 km diagonal) - smaller clusters
    adaptiveRadius = Math.min(1.5, Math.max(0.8, diagonalDistance / 15));
  } else {
    // Small area - use base radius with minor adjustments
    const density = usersWithLocation.length / Math.max(diagonalDistance, 1);
    adaptiveRadius = density > 10 ? baseRadius * 0.8 : baseRadius * 1.2;
  }
  
  console.log(`Dynamic clustering for ${usersWithLocation.length} users across ${diagonalDistance.toFixed(1)}km diagonal: radius ${adaptiveRadius.toFixed(2)}km`);
  
  return adaptiveRadius;
};

/**
 * Enhanced clustering algorithm that ensures nearby users are properly grouped
 */
export const clusterNearbyUsers = (users: AppUser[], baseClusterRadius: number = 0.5): ClusterGroup[] => {
  if (users.length === 0) return [];
  
  const clusters: ClusterGroup[] = [];
  const processedUsers = new Set<string>();
  
  // Filter users with valid locations
  const usersWithLocation = users.filter(u => u.location?.lat && u.location?.lng);
  
  if (usersWithLocation.length === 0) return [];
  
  // Calculate dynamic cluster radius for the geographic spread
  const clusterRadius = calculateDynamicClusterRadius(usersWithLocation, baseClusterRadius);
  
  // Sort users by their density (number of nearby users) to process dense areas first
  const usersWithDensity = usersWithLocation.map(user => {
    const nearbyCount = usersWithLocation.filter(otherUser => {
      if (otherUser.id === user.id) return false;
      
      const distance = calculateDistance(
        user.location!.lat,
        user.location!.lng,
        otherUser.location!.lat,
        otherUser.location!.lng
      );
      
      return distance <= clusterRadius;
    }).length;
    
    return { user, nearbyCount };
  });
  
  // Sort by density (descending) - process densest areas first
  usersWithDensity.sort((a, b) => b.nearbyCount - a.nearbyCount);
  
  // Process each user as a potential cluster center
  for (const { user } of usersWithDensity) {
    if (processedUsers.has(user.id) || !user.location) continue;
    
    // Create new cluster with this user as seed
    const cluster: ClusterGroup = {
      center: { ...user.location },
      users: [user],
      radius: clusterRadius
    };
    
    processedUsers.add(user.id);
    
    // Find all users within cluster radius and add them to this cluster
    const nearbyUsers = usersWithLocation.filter(otherUser => {
      if (processedUsers.has(otherUser.id) || !otherUser.location) return false;
      
      const distance = calculateDistance(
        user.location!.lat,
        user.location!.lng,
        otherUser.location.lat,
        otherUser.location.lng
      );
      
      return distance <= clusterRadius;
    });
    
    // Add all nearby users to this cluster
    nearbyUsers.forEach(nearbyUser => {
      cluster.users.push(nearbyUser);
      processedUsers.add(nearbyUser.id);
    });
    
    // Recalculate cluster center as centroid of all users in cluster
    if (cluster.users.length > 1) {
      const totalLat = cluster.users.reduce((sum, u) => sum + (u.location?.lat || 0), 0);
      const totalLng = cluster.users.reduce((sum, u) => sum + (u.location?.lng || 0), 0);
      
      cluster.center = {
        lat: totalLat / cluster.users.length,
        lng: totalLng / cluster.users.length
      };
    }
    
    clusters.push(cluster);
  }
  
  console.log(`Clustering complete: ${users.length} users grouped into ${clusters.length} clusters`);
  clusters.forEach((cluster, i) => {
    console.log(`Cluster ${i + 1}: ${cluster.users.length} users at (${cluster.center.lat.toFixed(4)}, ${cluster.center.lng.toFixed(4)})`);
  });
  
  return clusters;
};

/**
 * Create heatmap-style markers for user clusters with improved visibility for large areas
 */
export const createClusterMarkers = (
  clusters: ClusterGroup[],
  vectorSource: VectorSource,
  currentUser: AppUser | null
): Feature[] => {
  const features: Feature[] = [];
  
  for (const cluster of clusters) {
    const userCount = cluster.users.length;
    
    // Always create cluster markers now, even for single users
    const feature = new Feature({
      geometry: new Point(fromLonLat([cluster.center.lng, cluster.center.lat])),
      isCluster: true,
      clusterSize: userCount,
      clusterUsers: cluster.users,
      name: userCount === 1 ? `1 user nearby` : `${userCount} users nearby`,
      isBusiness: false, // Default to false since we don't have business type info
      // Don't set userId for any clusters to make them non-clickable
      isClickable: false
    });
    features.push(feature);
  }
  
  return features;
};
