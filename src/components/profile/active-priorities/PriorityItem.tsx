
import React from 'react';
import { Button } from "@/components/ui/button";
import { ActivePriority } from '@/lib/supabase/profiles/types';
import PriorityDisplay from './PriorityDisplay';

interface PriorityItemProps {
  priority: ActivePriority;
  onRemovePriority: (priorityId: string) => void;
}

const PriorityItem: React.FC<PriorityItemProps> = ({
  priority,
  onRemovePriority
}) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex-1 mr-2">
        <PriorityDisplay priority={priority} variant="compact" />
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onRemovePriority(priority.id)}
        className="flex-shrink-0"
      >
        Remove
      </Button>
    </div>
  );
};

export default PriorityItem;
