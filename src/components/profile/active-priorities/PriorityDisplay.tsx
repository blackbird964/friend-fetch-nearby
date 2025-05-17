
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
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
        {/* Only show location badge if it exists */}
        {priority.location && (
          <div className="flex flex-wrap gap-2 mt-1.5">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              {priority.location}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriorityDisplay;
