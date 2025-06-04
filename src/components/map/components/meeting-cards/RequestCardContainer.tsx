
import React, { useRef, useEffect } from 'react';

interface RequestCardContainerProps {
  selectedUser: string | null;
  children: React.ReactNode;
  stopPropagation: (e: React.MouseEvent) => void;
}

const RequestCardContainer: React.FC<RequestCardContainerProps> = ({
  selectedUser,
  children,
  stopPropagation
}) => {
  const requestCardRef = useRef<HTMLDivElement>(null);
  
  // Add click capture effect and log when component mounts
  useEffect(() => {
    console.log("[RequestCardContainer] Mounted with selectedUser:", selectedUser);
    if (!requestCardRef.current || !selectedUser) return;
    
    const handleDocumentClick = (e: MouseEvent) => {
      // Only prevent map clicks if the click is outside the card
      if (requestCardRef.current && !requestCardRef.current.contains(e.target as Node)) {
        console.log("[RequestCardContainer] Click outside card detected, allowing map interaction");
        return;
      }
      
      // If click is inside the card but not on a button, prevent map interaction
      const target = e.target as HTMLElement;
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      
      if (!isButton && requestCardRef.current && requestCardRef.current.contains(e.target as Node)) {
        console.log("[RequestCardContainer] Click inside card (non-button) detected, preventing map interaction");
        e.stopPropagation();
      }
    };
    
    // Use capture phase but be more selective about what we stop
    document.addEventListener('click', handleDocumentClick, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, [selectedUser]);

  // Don't render if no selected user
  if (!selectedUser) {
    return null;
  }

  return (
    <div 
      ref={requestCardRef}
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
    >
      {children}
    </div>
  );
};

export default RequestCardContainer;
