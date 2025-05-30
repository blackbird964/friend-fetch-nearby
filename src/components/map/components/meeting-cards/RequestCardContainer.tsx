
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
      // If the click is inside the request card, prevent it from propagating
      if (requestCardRef.current && requestCardRef.current.contains(e.target as Node)) {
        console.log("[RequestCardContainer] Click inside card detected");
        e.stopPropagation();
      }
    };
    
    // Capture phase ensures our handler runs before the map click handler
    document.addEventListener('click', handleDocumentClick, { capture: true });
    
    // Handle buttons separately
    const handleButtonClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        console.log("[RequestCardContainer] Button click detected, stopping propagation");
        e.stopPropagation();
      }
    };
    
    document.addEventListener('click', handleButtonClick, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      document.removeEventListener('click', handleButtonClick, { capture: true });
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
      onClick={(e) => {
        console.log("[RequestCardContainer] Card container clicked");
        stopPropagation(e);
        e.preventDefault(); 
      }}
    >
      {children}
    </div>
  );
};

export default RequestCardContainer;
