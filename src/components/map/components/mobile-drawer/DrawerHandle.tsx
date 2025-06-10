
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DrawerHandleProps {
  onClick: () => void;
  userCount: number;
}

const DrawerHandle: React.FC<DrawerHandleProps> = ({ onClick, userCount }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[DrawerHandle] Button clicked, userCount:', userCount);
    onClick();
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed top-20 right-4 z-30 md:hidden bg-white text-gray-900 shadow-lg hover:bg-gray-50 border border-gray-200"
      size="sm"
    >
      <Users className="h-4 w-4 mr-2" />
      <span>{userCount}</span>
    </Button>
  );
};

export default DrawerHandle;
