
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Activity } from "lucide-react";
import { ActivePriority } from '@/lib/supabase/profiles/types';

interface PriorityDisplayProps {
  priority: ActivePriority;
  variant?: 'default' | 'compact';
}

const PriorityDisplay: React.FC<PriorityDisplayProps> = ({ 
  priority,
  variant = 'default'
}) => {
  const isCompact = variant === 'compact';
  
  return (
    <div className={`bg-muted/40 rounded-lg p-3 ${isCompact ? 'mb-2' : ''}`}>
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
  );
};

export default PriorityDisplay;
