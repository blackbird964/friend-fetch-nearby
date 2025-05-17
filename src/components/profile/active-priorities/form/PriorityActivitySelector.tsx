
import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PriorityActivitySelectorProps {
  activities: string[];
  value: string;
  onActivityChange: (value: string) => void;
}

const PriorityActivitySelector: React.FC<PriorityActivitySelectorProps> = ({
  activities,
  value,
  onActivityChange,
}) => {
  return (
    <div>
      <Label htmlFor="activity">Activity</Label>
      <Select 
        value={value} 
        onValueChange={onActivityChange}
      >
        <SelectTrigger id="activity">
          <SelectValue placeholder="Select an activity" />
        </SelectTrigger>
        <SelectContent>
          {activities.map((act) => (
            <SelectItem key={act} value={act}>
              {act}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PriorityActivitySelector;
