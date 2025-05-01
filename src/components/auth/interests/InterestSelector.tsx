
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InterestSelectorProps {
  interests: string[];
  currentInterest: string;
  setCurrentInterest: (interest: string) => void;
  handleAddInterest: () => void;
  handleRemoveInterest: (interest: string) => void;
  availableInterests: string[];
}

const InterestSelector: React.FC<InterestSelectorProps> = ({
  interests,
  currentInterest,
  setCurrentInterest,
  handleAddInterest,
  handleRemoveInterest,
  availableInterests
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Interests
      </label>
      <div className="flex space-x-2">
        <Select value={currentInterest} onValueChange={setCurrentInterest}>
          <SelectTrigger>
            <SelectValue placeholder="Select interests" />
          </SelectTrigger>
          <SelectContent>
            {availableInterests.map((interest) => (
              <SelectItem key={interest} value={interest}>
                {interest}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={handleAddInterest} disabled={!currentInterest}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {interests.map((interest) => (
          <Badge key={interest} variant="secondary" className="flex items-center gap-1">
            {interest}
            <button
              type="button"
              onClick={() => handleRemoveInterest(interest)}
              className="ml-1 rounded-full hover:bg-gray-200 p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default InterestSelector;
