
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getUpcomingSessions, completeSession, cancelSession, UpcomingSession } from '@/services/upcoming-sessions';
import { toast } from 'sonner';

export function useUpcomingSessions() {
  const { currentUser } = useAppContext();
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const sessions = await getUpcomingSessions();
        setUpcomingSessions(sessions);
      } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [currentUser]);

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const success = await completeSession(sessionId);
      
      if (success) {
        // Remove from local state
        setUpcomingSessions(prev => prev.filter(session => session.id !== sessionId));
        toast.success('Session completed! Your catch-up time has been updated.');
      } else {
        toast.error('Failed to complete session. Please try again.');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session. Please try again.');
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      const success = await cancelSession(sessionId);
      
      if (success) {
        // Remove from local state
        setUpcomingSessions(prev => prev.filter(session => session.id !== sessionId));
        toast.success('Meetup cancelled successfully.');
      } else {
        toast.error('Failed to cancel meetup. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel meetup. Please try again.');
    }
  };

  return {
    upcomingSessions,
    isLoading,
    handleCompleteSession,
    handleCancelSession,
    refetch: () => {
      if (currentUser) {
        setIsLoading(true);
        getUpcomingSessions().then(sessions => {
          setUpcomingSessions(sessions);
          setIsLoading(false);
        });
      }
    }
  };
}
