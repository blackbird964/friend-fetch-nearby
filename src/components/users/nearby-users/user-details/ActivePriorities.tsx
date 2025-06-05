
import React from 'react';
import { ActivePriority } from '@/lib/supabase/profiles/types';
import { Badge } from "@/components/ui/badge";

interface ActivePrioritiesProps {
  priorities: ActivePriority[] | undefined;
}

const ActivePriorities: React.FC<ActivePrioritiesProps> = ({ priorities }) => {
  console.log("Rendering ActivePriorities with:", priorities);
  
  // Ensure priorities is always an array
  let prioritiesArray: ActivePriority[] = [];
  
  if (priorities) {
    if (Array.isArray(priorities)) {
      prioritiesArray = priorities;
    } else if (typeof priorities === 'string') {
      // Handle case where priorities might be a JSON string
      try {
        const parsed = JSON.parse(priorities);
        if (Array.isArray(parsed)) {
          prioritiesArray = parsed;
        }
      } catch (error) {
        console.warn("Failed to parse priorities string:", error);
      }
    } else if (typeof priorities === 'object') {
      // Handle case where it might be a single object
      prioritiesArray = [priorities as ActivePriority];
    }
  }
  
  if (prioritiesArray.length === 0) {
    console.log("No priorities to display");
    return null;
  }
  
  return (
    <div className="space-y-2">
      {prioritiesArray.map((priority, index) => (
        <div key={priority.id || index} className="text-sm text-gray-700">
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
