
import { useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const useMobileDrawer = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const openDrawer = useCallback(() => {
    if (isMobile) {
      setIsDrawerOpen(true);
    }
  }, [isMobile]);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    if (isMobile) {
      setIsDrawerOpen(prev => !prev);
    }
  }, [isMobile]);

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    isMobile
  };
};
