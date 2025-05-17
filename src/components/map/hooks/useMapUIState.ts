
import { useState } from 'react';

/**
 * Hook to manage map UI state
 */
export const useMapUIState = () => {
  // Meeting and user selection state
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [movingUsers, setMovingUsers] = useState<Set<string>>(new Set());
  const [completedMoves, setCompletedMoves] = useState<Set<string>>(new Set());
  
  return {
    // User selection state
    selectedUser,
    setSelectedUser,
    
    // Meeting duration
    selectedDuration, 
    setSelectedDuration,
    
    // Movement tracking
    movingUsers,
    setMovingUsers,
    completedMoves,
    setCompletedMoves
  };
};
