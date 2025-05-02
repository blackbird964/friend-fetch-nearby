
/**
 * Calculate distance between two geographic coordinates in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Default location coordinates (Wynyard)
 */
export const DEFAULT_LOCATION = { lat: -33.8666, lng: 151.2073 };

/**
 * Create a simulated user at a specific distance from a given location
 */
export const createNearbyUser = (baseLocation: { lat: number, lng: number }, distanceKm: number, bearingDegrees: number, userId: string, name: string) => {
  // Convert bearing to radians
  const bearingRad = bearingDegrees * Math.PI / 180;
  
  // Earth's radius in km
  const R = 6371;
  
  // Convert lat/lon to radians
  const lat1 = baseLocation.lat * Math.PI / 180;
  const lon1 = baseLocation.lng * Math.PI / 180;
  
  // Calculate new position
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) + 
    Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(bearingRad)
  );
  
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearingRad) * Math.sin(distanceKm / R) * Math.cos(lat1),
    Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  // Convert back to degrees
  const newLat = lat2 * 180 / Math.PI;
  const newLng = lon2 * 180 / Math.PI;
  
  return {
    id: userId,
    name,
    location: {
      lat: newLat,
      lng: newLng
    }
  };
};

/**
 * Format location for database storage
 */
export const formatLocationForStorage = (location: { lat: number, lng: number }) => {
  // This should match the format expected by your database
  // For JSON storage or TEXT:
  return JSON.stringify(location);
  
  // For point type (uncomment if using PostgreSQL point type):
  // return `(${location.lng},${location.lat})`;
};
