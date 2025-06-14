
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
    adaptiveRadius = Math.min(5.0, Math.max(2.0, diagonalDistance / 20));
  } else if (diagonalDistance > 20) {
    // Large metropolitan area (20-50 km diagonal) - moderate clusters
    adaptiveRadius = Math.min(3.0, Math.max(1.0, diagonalDistance / 15));
  } else if (diagonalDistance > 10) {
    // Medium area (10-20 km diagonal) - smaller clusters
    adaptiveRadius = Math.min(2.0, Math.max(0.8, diagonalDistance / 12));
  } else {
    // Small area - use base radius with minor adjustments
    const density = usersWithLocation.length / Math.max(diagonalDistance, 1);
    adaptiveRadius = density > 10 ? baseRadius * 0.7 : baseRadius;
  }
  
  console.log(`Dynamic clustering for ${usersWithLocation.length} users across ${diagonalDistance.toFixed(1)}km diagonal: radius ${adaptiveRadius.toFixed(2)}km`);
  
  return adaptiveRadius;
};

/**
 * Enhanced clustering algorithm for large metropolitan areas
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
  
  // For very sparse distributions, use a grid-based approach
  const shouldUseGridClustering = usersWithLocation.length > 20 && clusterRadius > 2.0;
  
  if (shouldUseGridClustering) {
    return createGridBasedClusters(usersWithLocation, clusterRadius);
  }
  
  // Standard density-based clustering for smaller areas
  return createDensityBasedClusters(usersWithLocation, clusterRadius, processedUsers);
};

/**
 * Grid-based clustering for very large areas with many users
 */
const createGridBasedClusters = (users: AppUser[], clusterRadius: number): ClusterGroup[] => {
  const clusters: ClusterGroup[] = [];
  const processedUsers = new Set<string>();
  
  // Create a grid based on cluster radius
  const gridSize = clusterRadius * 0.8; // Slightly smaller than cluster radius for overlap
  const userGrid = new Map<string, AppUser[]>();
  
  // Assign users to grid cells
  users.forEach(user => {
    if (!user.location) return;
    
    const gridX = Math.floor(user.location.lat / gridSize);
    const gridY = Math.floor(user.location.lng / gridSize);
    const gridKey = `${gridX},${gridY}`;
    
    if (!userGrid.has(gridKey)) {
      userGrid.set(gridKey, []);
    }
    userGrid.get(gridKey)!.push(user);
  });
  
  // Process each grid cell and adjacent cells
  for (const [gridKey, gridUsers] of userGrid.entries()) {
    if (gridUsers.length === 0) continue;
    
    // Find center of users in this grid area
    const totalLat = gridUsers.reduce((sum, u) => sum + u.location!.lat, 0);
    const totalLng = gridUsers.reduce((sum, u) => sum + u.location!.lng, 0);
    
    const cluster: ClusterGroup = {
      center: {
        lat: totalLat / gridUsers.length,
        lng: totalLng / gridUsers.length
      },
      users: [...gridUsers],
      radius: clusterRadius
    };
    
    gridUsers.forEach(user => processedUsers.add(user.id));
    clusters.push(cluster);
  }
  
  console.log(`Grid-based clustering: ${users.length} users into ${clusters.length} clusters`);
  return clusters;
};

/**
 * Traditional density-based clustering for smaller areas
 */
const createDensityBasedClusters = (users: AppUser[], clusterRadius: number, processedUsers: Set<string>): ClusterGroup[] => {
  const clusters: ClusterGroup[] = [];
  
  // Sort users by density (users with more neighbors get processed first)
  const usersWithNeighborCounts = users.map(user => {
    const neighborCount = users.filter(otherUser => {
      if (otherUser.id === user.id || !otherUser.location || !user.location) return false;
      
      const distance = calculateDistance(
        user.location.lat,
        user.location.lng,
        otherUser.location.lat,
        otherUser.location.lng
      );
      
      return distance <= clusterRadius;
    }).length;
    
    return { user, neighborCount };
  });
  
  // Sort by neighbor count (descending) to process dense areas first
  usersWithNeighborCounts.sort((a, b) => b.neighborCount - a.neighborCount);
  
  for (const { user } of usersWithNeighborCounts) {
    if (processedUsers.has(user.id) || !user.location) continue;
    
    const cluster: ClusterGroup = {
      center: { ...user.location },
      users: [user],
      radius: clusterRadius
    };
    
    processedUsers.add(user.id);
    
    // Find all users within cluster radius of this user
    const nearbyUsers = users.filter(otherUser => {
      if (processedUsers.has(otherUser.id) || !otherUser.location) return false;
      
      const distance = calculateDistance(
        user.location!.lat,
        user.location!.lng,
        otherUser.location.lat,
        otherUser.location.lng
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
      const totalLat = cluster.users.reduce((sum, u) => sum + (u.location?.lat || 0), 0);
      const totalLng = cluster.users.reduce((sum, u) => sum + (u.location?.lng || 0), 0);
      
      cluster.center = {
        lat: totalLat / cluster.users.length,
        lng: totalLng / cluster.users.length
      };
    }
    
    clusters.push(cluster);
  }
  
  console.log(`Density-based clustering: ${users.length} users into ${clusters.length} clusters`);
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
    
    if (userCount === 1) {
      // Single user - create normal marker
      const user = cluster.users[0];
      
      if (!user.location) continue;
      
      const feature = new Feature({
        geometry: new Point(fromLonLat([user.location.lng, user.location.lat])),
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
