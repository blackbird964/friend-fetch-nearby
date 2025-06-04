
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
      // Only close the card if the click is outside the card entirely
      if (requestCardRef.current && !requestCardRef.current.contains(e.target as Node)) {
        console.log("[RequestCardContainer] Click outside card detected, closing card");
        // Trigger the onCancel callback to close the card
        const cancelEvent = new MouseEvent('click', { bubbles: false });
        stopPropagation(cancelEvent as any);
      }
    };
    
    // Add the event listener
    document.addEventListener('click', handleDocumentClick, { capture: false });
    
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: false });
    };
  }, [selectedUser, stopPropagation]);

  // Don't render if no selected user
  if (!selectedUser) {
    return null;
  }

  return (
    <div 
      ref={requestCardRef}
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
      onClick={(e) => {
        // Stop propagation only for the container, but allow button clicks to bubble up normally
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
};

export default RequestCardContainer;
