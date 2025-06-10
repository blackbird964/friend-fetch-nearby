
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppUser } from '@/context/types';
import UserListPanel from '../side-panel/UserListPanel';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  currentUser: AppUser | null;
  radiusInKm: number;
  onUserSelect: (user: AppUser) => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  radiusInKm,
  onUserSelect
}) => {
  // Handle backdrop click to close drawer
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent drawer content clicks from closing drawer
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 md:hidden"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Drawer */}
      <div 
        className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl transform transition-transform duration-300"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">People Nearby</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <UserListPanel 
            users={users}
            currentUser={currentUser}
            radiusInKm={radiusInKm}
            onUserSelect={onUserSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
