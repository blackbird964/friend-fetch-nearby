
import React from 'react';
import { ActivePriority } from '@/lib/supabase/profiles/types';
import PriorityItem from './PriorityItem';
import PriorityLimitMessage from './PriorityLimitMessage';

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
        <PriorityItem
          key={priority.id}
          priority={priority}
          onRemovePriority={onRemovePriority}
        />
      ))}
      
      <PriorityLimitMessage show={priorities.length >= 5} />
    </div>
  );
};

export default PriorityList;
