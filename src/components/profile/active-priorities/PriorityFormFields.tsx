
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ActivePriority } from '@/lib/supabase/profiles/types';
import PRIORITY_CATEGORIES from './PriorityCategories';
import { v4 as uuidv4 } from 'uuid';
import { 
  PriorityCategorySelector,
  PriorityActivitySelector,
  PriorityDetailsForm 
} from './form';

interface PriorityFormFieldsProps {
  onAddPriority: (priority: ActivePriority) => void;
  isMaxPriorities: boolean;
}

const PriorityFormFields: React.FC<PriorityFormFieldsProps> = ({
  onAddPriority,
  isMaxPriorities
}) => {
  const [category, setCategory] = useState<string>("");
  const [activity, setActivity] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("");
  const [timePreference, setTimePreference] = useState<string>("");
  const [urgency, setUrgency] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [customActivity, setCustomActivity] = useState<string>("");

  const activities = PRIORITY_CATEGORIES.find(cat => cat.name === category)?.activities || [];

  const handleAddPriority = () => {
    if (!category || (!activity && !customActivity)) return;
    
    const finalActivity = activity === "Custom" ? customActivity : activity;
    
    const newPriority: ActivePriority = {
      id: uuidv4(),
      category,
      activity: finalActivity,
      frequency: frequency as any,
      timePreference: timePreference as any,
      urgency: urgency as any,
      location: location || undefined,
      experienceLevel: experienceLevel as any,
    };
    
    onAddPriority(newPriority);
    
    // Reset form fields
    setCategory("");
    setActivity("");
    setFrequency("");
    setTimePreference("");
    setUrgency("");
    setLocation("");
    setExperienceLevel("");
    setCustomActivity("");
  };

  if (isMaxPriorities) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 mt-4">
      <div className="grid grid-cols-1 gap-4">
        <PriorityCategorySelector 
          value={category} 
          onChange={setCategory} 
        />

        {category && (
          <PriorityActivitySelector 
            activities={activities}
            value={activity}
            customActivity={customActivity}
            onActivityChange={setActivity}
            onCustomActivityChange={setCustomActivity}
          />
        )}
      </div>
      
      {category && activity && (
        <PriorityDetailsForm 
          frequency={frequency}
          timePreference={timePreference}
          urgency={urgency}
          experienceLevel={experienceLevel}
          location={location}
          onFrequencyChange={setFrequency}
          onTimePreferenceChange={setTimePreference}
          onUrgencyChange={setUrgency}
          onExperienceLevelChange={setExperienceLevel}
          onLocationChange={(e) => setLocation(e.target.value)}
        />
      )}
      
      <div className="flex justify-end">
        <Button 
          type="button"
          onClick={handleAddPriority}
          disabled={!category || (!activity && !customActivity)}
        >
          Add Priority
        </Button>
      </div>
    </div>
  );
};

export default PriorityFormFields;
