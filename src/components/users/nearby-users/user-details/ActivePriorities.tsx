
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Activity } from "lucide-react";
import { ActivePriority } from '@/lib/supabase/profiles/types';

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
          <div key={priority.id} className="bg-muted/40 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Activity className="w-4 h-4 mr-1 text-primary" />
              <h4 className="font-medium text-sm">{priority.activity}</h4>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="block">{priority.category}</span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {priority.frequency && (
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" />
                    {priority.frequency}
                    {priority.timePreference && ` • ${priority.timePreference}`}
                  </Badge>
                )}
                {priority.urgency && (
                  <Badge variant="secondary" className="text-xs">
                    {priority.urgency}
                  </Badge>
                )}
                {priority.location && (
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <MapPin className="w-3 h-3" />
                    {priority.location}
                  </Badge>
                )}
                {priority.experienceLevel && (
                  <Badge variant="outline" className="text-xs">
                    {priority.experienceLevel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivePriorities;
