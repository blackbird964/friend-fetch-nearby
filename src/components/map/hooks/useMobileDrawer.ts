
import { useState, useCallback, useRef, useEffect } from 'react';

export const useMobileDrawer = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isAnimatingRef = useRef(false);

  const openDrawer = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsDrawerOpen(true);
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 300);
  }, []);

  const closeDrawer = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsDrawerOpen(false);
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 300);
  }, []);

  const toggleDrawer = useCallback(() => {
    if (isAnimatingRef.current) return;
    isDrawerOpen ? closeDrawer() : openDrawer();
  }, [isDrawerOpen, closeDrawer, openDrawer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isAnimatingRef.current = false;
    };
  }, []);

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer
  };
};
