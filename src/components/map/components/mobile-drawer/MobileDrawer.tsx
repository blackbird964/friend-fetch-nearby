
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  children,
  title = "People Nearby"
}) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[MobileDrawer] Backdrop clicked, closing drawer');
    onClose();
  };

  const handleBackdropTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[MobileDrawer] Backdrop touched, closing drawer');
    onClose();
  };

  const handleDrawerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  console.log('[MobileDrawer] Rendering, isOpen:', isOpen);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
        onClick={handleBackdropClick}
        onTouchStart={handleBackdropTouchStart}
        style={{ touchAction: 'manipulation' }}
      />
      
      {/* Drawer */}
      <div 
        className="fixed inset-y-0 right-0 z-50 w-80 max-w-[80vw] bg-background shadow-lg md:hidden animate-slide-in-right"
        onClick={handleDrawerClick}
        onTouchStart={handleDrawerTouchStart}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            onTouchStart={onClose}
            className="h-8 w-8 p-0"
            style={{ 
              minHeight: '44px', 
              minWidth: '44px',
              touchAction: 'manipulation'
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto h-[calc(100vh-65px)]" style={{ touchAction: 'pan-y' }}>
          {children}
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
