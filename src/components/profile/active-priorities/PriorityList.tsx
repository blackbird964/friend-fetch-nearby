
import React from 'react';
import { Button } from "@/components/ui/button";
import { ActivePriority } from '@/lib/supabase/profiles/types';
import PriorityDisplay from './PriorityDisplay';

interface PriorityListProps {
  priorities: ActivePriority[];
  onRemovePriority: (priorityId: string) => void;
}

const PriorityList: React.FC<PriorityListProps> = ({
  priorities,
  onRemovePriority
}) => {
  if (!priorities.length) {
    return null;
  }
  
  return (
    <div>
      {priorities.map((priority) => (
        <div key={priority.id} className="flex items-center justify-between mb-2">
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
      ))}
      
      {priorities.length >= 5 && (
        <p className="text-sm text-muted-foreground mt-2">
          You've reached the maximum of 5 priorities. Remove one to add another.
        </p>
      )}
    </div>
  );
};

export default PriorityList;
