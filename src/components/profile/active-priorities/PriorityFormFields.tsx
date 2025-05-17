
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ActivePriority } from '@/lib/supabase/profiles/types';
import { v4 as uuidv4 } from 'uuid';
import { PriorityActivitySelector } from './form';

// The curated list of activities popular in Sydney
const SYDNEY_ACTIVITIES = [
  "Beach visits (Bondi, Manly, Coogee)",
  "Coastal walks (Bondi to Coogee)",
  "Harbor ferry rides",
  "Sydney Opera House tours",
  "Exploring The Rocks",
  "Visiting Taronga Zoo",
  "Paddleboarding on Sydney Harbor",
  "Dining in Darling Harbour",
  "Shopping at Queen Victoria Building",
  "Hiking in Blue Mountains",
  "Wine tasting in Hunter Valley",
  "Attending local festivals",
  "Surfing lessons",
  "Royal Botanic Gardens visits",
  "Weekend markets exploration"
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
      // Set defaults for other fields
      frequency: "weekly",
      timePreference: "flexible",
      urgency: "ongoing",
      experienceLevel: "beginner",
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
