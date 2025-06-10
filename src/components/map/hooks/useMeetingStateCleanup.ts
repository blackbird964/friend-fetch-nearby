
import { useEffect } from 'react';

interface UseMeetingStateCleanupProps {
  selectedUser: string | null;
  setMovingUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  setCompletedMoves: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const useMeetingStateCleanup = ({
  selectedUser,
  setMovingUsers,
  setCompletedMoves
}: UseMeetingStateCleanupProps) => {
  useEffect(() => {
    console.log(`[useMeetingStateCleanup] selectedUser changed to: ${selectedUser}`);
    
    if (selectedUser) {
      // Immediately clear the selected user from meeting states
      setMovingUsers(prev => {
        const next = new Set(prev);
        if (next.has(selectedUser)) {
          console.log(`[useMeetingStateCleanup] Removing ${selectedUser} from movingUsers`);
          next.delete(selectedUser);
        }
        return next;
      });
      
      setCompletedMoves(prev => {
        const next = new Set(prev);
        if (next.has(selectedUser)) {
          console.log(`[useMeetingStateCleanup] Removing ${selectedUser} from completedMoves`);
          next.delete(selectedUser);
        }
        return next;
      });
    }
  }, [selectedUser, setMovingUsers, setCompletedMoves]);
};
