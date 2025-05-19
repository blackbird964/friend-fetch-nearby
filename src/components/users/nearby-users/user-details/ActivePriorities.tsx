
import React from 'react';
import { ActivePriority } from '@/lib/supabase/profiles/types';
import { Badge } from "@/components/ui/badge";

interface ActivePrioritiesProps {
  priorities: ActivePriority[] | undefined;
}

const ActivePriorities: React.FC<ActivePrioritiesProps> = ({ priorities }) => {
  if (!priorities || priorities.length === 0) return null;
  
  return (
    <div className="space-y-2">
      {priorities.map((priority) => (
        <div key={priority.id} className="text-sm text-gray-700">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mr-2">
            {priority.activity}
          </Badge>
          {priority.frequency && (
            <span className="text-xs text-gray-500 mr-1">
              {priority.frequency}
            </span>
          )}
          {priority.timePreference && (
            <span className="text-xs text-gray-500">
              • {priority.timePreference}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ActivePriorities;
