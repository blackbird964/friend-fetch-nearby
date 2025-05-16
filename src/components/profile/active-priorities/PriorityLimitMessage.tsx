
import React from 'react';

interface PriorityLimitMessageProps {
  show: boolean;
}

const PriorityLimitMessage: React.FC<PriorityLimitMessageProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <p className="text-sm text-muted-foreground mt-2">
      You've reached the maximum of 5 priorities. Remove one to add another.
    </p>
  );
};

export default PriorityLimitMessage;
