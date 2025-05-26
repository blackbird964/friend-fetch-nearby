
// Helper function to ensure timestamp is always a number
export const normalizeTimestamp = (timestamp: string | number): number => {
  return typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
};
