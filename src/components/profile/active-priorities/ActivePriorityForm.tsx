
import React from 'react';
import { ActivePriority } from '@/lib/supabase/profiles/types';
import PriorityList from './PriorityList';
import PriorityFormFields from './PriorityFormFields';

interface ActivePriorityFormProps {
  priorities: ActivePriority[];
  onAddPriority: (priority: ActivePriority) => void;
  onRemovePriority: (priorityId: string) => void;
}

const ActivePriorityForm: React.FC<ActivePriorityFormProps> = ({
  priorities,
  onAddPriority,
  onRemovePriority
}) => {
  const isMaxPriorities = priorities.length >= 5;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Current Activities (Maximum 5)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Share what Sydney activities you're interested in to connect with like-minded people.
        </p>
      
        <PriorityList 
          priorities={priorities}
          onRemovePriority={onRemovePriority}
        />

        <PriorityFormFields 
          onAddPriority={onAddPriority}
          isMaxPriorities={isMaxPriorities}
        />
      </div>
    </div>
  );
};

export default ActivePriorityForm;
