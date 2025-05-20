
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
  
  // Add click capture effect
  useEffect(() => {
    if (!requestCardRef.current || !selectedUser) return;
    
    const handleDocumentClick = (e: MouseEvent) => {
      // If the click is inside the request card, prevent it from propagating
      if (requestCardRef.current && requestCardRef.current.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };
    
    // Capture phase ensures our handler runs before the map click handler
    document.addEventListener('click', handleDocumentClick, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, [selectedUser]);

  return (
    <div 
      ref={requestCardRef}
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
      onClick={stopPropagation}
    >
      {children}
    </div>
  );
};

export default RequestCardContainer;
