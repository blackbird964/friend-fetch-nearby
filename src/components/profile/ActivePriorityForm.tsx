
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivePriority, PriorityCategory } from '@/lib/supabase/profiles/types';
import { v4 as uuidv4 } from 'uuid';

// Define priority categories with activities
const PRIORITY_CATEGORIES: PriorityCategory[] = [
  {
    name: "Parenting Activities",
    activities: ["Finding playdate partners", "Discovering family-friendly venues", "Organizing children's activities", "Seeking parent support groups"]
  },
  {
    name: "Fitness Goals",
    activities: ["Training for a 5K", "Finding a tennis partner", "Looking for yoga buddies", "Starting group workouts", "Seeking hiking companions"]
  },
  {
    name: "Local Exploration",
    activities: ["Checking out new cafés", "Finding hidden dining spots", "Exploring weekend markets", "Discovering local art galleries"]
  },
  {
    name: "Creative Pursuits",
    activities: ["Working on writing projects", "Starting painting/drawing", "Learning photography", "Making music", "Craft workshops"]
  },
  {
    name: "Professional Growth",
    activities: ["Building a startup", "Looking for co-working partners", "Seeking mentorship", "Skill exchange", "Networking in my industry"]
  },
  {
    name: "Social Activities",
    activities: ["Forming a game group", "Starting a book club", "Organizing team sports", "Planning community events"]
  }
];

interface ActivePriorityFormProps {
  priorities: ActivePriority[];
  onAddPriority: (priority: ActivePriority) => void;
  onRemovePriority: (priorityId: string) => void;
}

const ActivePriorityForm: React.FC<ActivePriorityFormProps> = ({
  priorities,
  onAddPriority,
  onRemovePriority
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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Current Priorities (Maximum 5)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Share what you're actively focused on right now to connect with like-minded people.
        </p>
      
        {priorities.map((priority) => (
          <div key={priority.id} className="flex items-center justify-between bg-muted/40 rounded-lg p-3 mb-2">
            <div>
              <p className="font-medium text-sm">{priority.activity}</p>
              <p className="text-xs text-muted-foreground">{priority.category}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onRemovePriority(priority.id)}
            >
              Remove
            </Button>
          </div>
        ))}

        {priorities.length >= 5 ? (
          <p className="text-sm text-muted-foreground mt-2">
            You've reached the maximum of 5 priorities. Remove one to add another.
          </p>
        ) : (
          <div className="border rounded-lg p-4 space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {category && (
                <div>
                  <Label htmlFor="activity">Activity</Label>
                  <Select 
                    value={activity} 
                    onValueChange={(val) => setActivity(val)}
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
                  
                  {activity === "Custom" && (
                    <div className="mt-2">
                      <Input
                        placeholder="Describe your activity"
                        value={customActivity}
                        onChange={(e) => setCustomActivity(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {category && activity && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select 
                    value={frequency} 
                    onValueChange={setFrequency}
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
                    onValueChange={setTimePreference}
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
                    onValueChange={setUrgency}
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
                    onValueChange={setExperienceLevel}
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
            )}
            
            {category && activity && (
              <div>
                <Label htmlFor="location">Preferred Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g., Surry Hills, CBD, Northern Beaches" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                type="button"
                onClick={handleAddPriority}
                disabled={!category || (!activity && !customActivity) || priorities.length >= 5}
              >
                Add Priority
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivePriorityForm;
