
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  customActivity: string;
  onActivityChange: (value: string) => void;
  onCustomActivityChange: (value: string) => void;
}

const PriorityActivitySelector: React.FC<PriorityActivitySelectorProps> = ({
  activities,
  value,
  customActivity,
  onActivityChange,
  onCustomActivityChange
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
          <SelectItem value="Custom">Custom activity</SelectItem>
        </SelectContent>
      </Select>
      
      {value === "Custom" && (
        <div className="mt-2">
          <Input
            placeholder="Describe your activity"
            value={customActivity}
            onChange={(e) => onCustomActivityChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default PriorityActivitySelector;
