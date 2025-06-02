
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { updateUserProfile } from '@/services/user/userProfileService';
import { toast } from 'sonner';
import PriorityCategories from '@/components/profile/active-priorities/PriorityCategories';

const TodayActivitiesSection: React.FC = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [hangoutDuration, setHangoutDuration] = useState<string>('30');
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize with current user's data
  useEffect(() => {
    if (currentUser?.todayActivities) {
      setSelectedActivities(currentUser.todayActivities);
    }
    if (currentUser?.preferredHangoutDuration) {
      setHangoutDuration(currentUser.preferredHangoutDuration);
    }
  }, [currentUser]);

  // Get all available activities from categories
  const allActivities = PriorityCategories.flatMap(category => category.activities);

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities(prev => {
      if (prev.includes(activity)) {
        return prev.filter(a => a !== activity);
      } else if (prev.length < 5) {
        return [...prev, activity];
      } else {
        toast.error('You can select up to 5 activities');
        return prev;
      }
    });
  };

  const handleSavePreferences = async () => {
    if (!currentUser) return;

    setIsUpdating(true);
    try {
      // For now, we'll just update the local state since the database fields don't exist yet
      // In a real implementation, you'd want to add these fields to the profiles table
      const updatedUser = {
        ...currentUser,
        todayActivities: selectedActivities,
        preferredHangoutDuration: hangoutDuration
      };

      // Try to update the profile (this will skip the todayActivities and preferredHangoutDuration fields)
      await updateUserProfile({ id: currentUser.id });
      
      // Update local state
      setCurrentUser(updatedUser);
      
      toast.success('Preferences saved locally!', {
        description: 'Note: Database persistence for activities is coming soon.'
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences', {
        description: 'Please try again or contact support if the issue persists.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Activities Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">What do you want to do today?</CardTitle>
          <p className="text-sm text-gray-600">Select up to 5 activities</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Activities */}
          {selectedActivities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedActivities.map((activity) => (
                <Badge key={activity} variant="default" className="flex items-center gap-1">
                  {activity}
                  <button
                    onClick={() => handleActivityToggle(activity)}
                    className="ml-1 rounded-full hover:bg-white/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Available Activities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allActivities.slice(0, 12).map((activity) => (
              <Button
                key={activity}
                variant={selectedActivities.includes(activity) ? "default" : "outline"}
                size="sm"
                onClick={() => handleActivityToggle(activity)}
                disabled={!selectedActivities.includes(activity) && selectedActivities.length >= 5}
                className="text-xs h-auto py-3 px-3 whitespace-normal text-left leading-tight hyphens-none break-words"
              >
                {activity}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hangout Duration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">How long do you want to hang out?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={hangoutDuration} onValueChange={setHangoutDuration}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="15" id="15min" />
              <Label htmlFor="15min">15 minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30" id="30min" />
              <Label htmlFor="30min">30 minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="45" id="45min" />
              <Label htmlFor="45min">45 minutes</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={handleSavePreferences} 
        disabled={isUpdating || selectedActivities.length === 0}
        className="w-full"
      >
        {isUpdating ? 'Saving...' : 'Save and find new friends'}
      </Button>
    </div>
  );
};

export default TodayActivitiesSection;
