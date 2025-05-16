
import React from 'react';
import { Button } from "@/components/ui/button";
import { ActivePriority } from '@/lib/supabase/profiles/types';

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
        <div key={priority.id} className="flex items-center justify-between bg-muted/40 rounded-lg p-3 mb-2">
          <div>
            <p className="font-medium text-sm">{priority.activity}</p>
            <p className="text-xs text-muted-foreground">{priority.category}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRemovePriority(priority.id)}
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
