
import React from 'react';
import { Users, ChevronLeft } from 'lucide-react';

interface DrawerHandleProps {
  userCount: number;
  onClick: () => void;
}

const DrawerHandle: React.FC<DrawerHandleProps> = ({ userCount, onClick }) => {
  // Prevent event bubbling to map
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="
        fixed top-1/2 right-0 -translate-y-1/2 z-30
        bg-white border border-gray-200 rounded-l-lg shadow-lg
        px-2 py-4 md:hidden
        hover:bg-gray-50 transition-colors
        flex flex-col items-center gap-1
        touch-manipulation
      "
      style={{ WebkitTapHighlightColor: 'transparent' }}
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
