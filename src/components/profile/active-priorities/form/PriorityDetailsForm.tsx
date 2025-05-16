
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

interface PriorityDetailsFormProps {
  frequency: string;
  timePreference: string;
  urgency: string;
  experienceLevel: string;
  location: string;
  onFrequencyChange: (value: string) => void;
  onTimePreferenceChange: (value: string) => void;
  onUrgencyChange: (value: string) => void;
  onExperienceLevelChange: (value: string) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PriorityDetailsForm: React.FC<PriorityDetailsFormProps> = ({
  frequency,
  timePreference,
  urgency,
  experienceLevel,
  location,
  onFrequencyChange,
  onTimePreferenceChange,
  onUrgencyChange,
  onExperienceLevelChange,
  onLocationChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select 
            value={frequency} 
            onValueChange={onFrequencyChange}
          >
            <SelectTrigger id="frequency">
              <SelectValue placeholder="How often?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="weekends">Weekends only</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="timePreference">Time Preference</Label>
          <Select 
            value={timePreference} 
            onValueChange={onTimePreferenceChange}
          >
            <SelectTrigger id="timePreference">
              <SelectValue placeholder="When?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
              <SelectItem value="night">Night</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="urgency">Timing</Label>
          <Select 
            value={urgency} 
            onValueChange={onUrgencyChange}
          >
            <SelectTrigger id="urgency">
              <SelectValue placeholder="When are you starting?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="now">Starting now</SelectItem>
              <SelectItem value="soon">Starting soon</SelectItem>
              <SelectItem value="ongoing">Ongoing project</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="experienceLevel">Experience Level</Label>
          <Select 
            value={experienceLevel} 
            onValueChange={onExperienceLevelChange}
          >
            <SelectTrigger id="experienceLevel">
              <SelectValue placeholder="Your experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="location">Preferred Location</Label>
        <Input 
          id="location" 
          placeholder="e.g., Surry Hills, CBD, Northern Beaches" 
          value={location}
          onChange={onLocationChange}
        />
      </div>
    </>
  );
};

export default PriorityDetailsForm;
