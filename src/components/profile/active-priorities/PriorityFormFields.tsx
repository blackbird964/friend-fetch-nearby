
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ActivePriority } from '@/lib/supabase/profiles/types';
import { v4 as uuidv4 } from 'uuid';
import { PriorityActivitySelector } from './form';

// Updated list of Sydney activities based on user request
const SYDNEY_ACTIVITIES = [
  "coffee",
  "lunch",
  "dog walking",
  "parent/toddler park catchup",
  "running",
  "gym",
  "beach",
  "co-working space catchup",
  "new to area - show me around!",
  "pokemon go"
];

interface PriorityFormFieldsProps {
  onAddPriority: (priority: ActivePriority) => void;
  isMaxPriorities: boolean;
}

const PriorityFormFields: React.FC<PriorityFormFieldsProps> = ({
  onAddPriority,
  isMaxPriorities
}) => {
  const [activity, setActivity] = useState<string>("");

  const handleAddPriority = () => {
    if (!activity) return;
    
    const newPriority: ActivePriority = {
      id: uuidv4(),
      category: "Sydney Activities",
      activity: activity,
      // Remove default values for these fields
      frequency: "",
      timePreference: "",
      urgency: "",
      experienceLevel: "",
    };
    
    onAddPriority(newPriority);
    
    // Reset form field
    setActivity("");
  };

  if (isMaxPriorities) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 mt-4">
      <div className="grid grid-cols-1 gap-4">
        <PriorityActivitySelector 
          activities={SYDNEY_ACTIVITIES}
          value={activity}
          onActivityChange={setActivity}
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="button"
          onClick={handleAddPriority}
          disabled={!activity}
        >
          Add Priority
        </Button>
      </div>
    </div>
  );
};

export default PriorityFormFields;
