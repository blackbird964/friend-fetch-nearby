
import { useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const useMobileDrawer = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const openDrawer = useCallback(() => {
    console.log('[useMobileDrawer] Opening drawer, isMobile:', isMobile);
    if (isMobile) {
      setIsDrawerOpen(true);
    }
  }, [isMobile]);

  const closeDrawer = useCallback(() => {
    console.log('[useMobileDrawer] Closing drawer');
    setIsDrawerOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    console.log('[useMobileDrawer] Toggling drawer, current state:', isDrawerOpen, 'isMobile:', isMobile);
    if (isMobile) {
      setIsDrawerOpen(prev => !prev);
    }
  }, [isMobile, isDrawerOpen]);

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    isMobile
  };
};
