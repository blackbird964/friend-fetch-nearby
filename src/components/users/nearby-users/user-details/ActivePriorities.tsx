
import React from 'react';
import { ActivePriority } from '@/lib/supabase/profiles/types';
import PriorityDisplay from '@/components/profile/active-priorities/PriorityDisplay';

interface ActivePrioritiesProps {
  priorities: ActivePriority[] | undefined;
}

const ActivePriorities: React.FC<ActivePrioritiesProps> = ({ priorities }) => {
  if (!priorities || priorities.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Active Priorities</h3>
      <div className="space-y-2">
        {priorities.map((priority) => (
          <PriorityDisplay key={priority.id} priority={priority} />
        ))}
      </div>
    </div>
  );
};

export default ActivePriorities;
