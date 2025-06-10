
import React, { useCallback } from 'react';
import { Users, ChevronLeft } from 'lucide-react';

interface DrawerHandleProps {
  userCount: number;
  onClick: () => void;
}

const DrawerHandle: React.FC<DrawerHandleProps> = ({ userCount, onClick }) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add safety check
    if (typeof onClick === 'function') {
      onClick();
    }
  }, [onClick]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof onClick === 'function') {
      onClick();
    }
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="
        fixed top-1/2 right-0 -translate-y-1/2 z-30
        bg-white border border-gray-200 rounded-l-lg shadow-lg
        px-2 py-4 md:hidden
        hover:bg-gray-50 transition-colors
        flex flex-col items-center gap-1
        touch-manipulation
        min-h-[44px] min-w-[44px]
      "
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        touchAction: 'manipulation'
      }}
    >
      <Users className="h-4 w-4 text-gray-600" />
      <span className="text-xs font-medium text-gray-700 writing-mode-vertical transform -rotate-90 whitespace-nowrap">
        {userCount} nearby
      </span>
      <ChevronLeft className="h-3 w-3 text-gray-400" />
    </button>
  );
};

export default DrawerHandle;
