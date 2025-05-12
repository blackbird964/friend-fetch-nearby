
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import InterestSelector from '../interests/InterestSelector';
import { INTERESTS } from '@/hooks/useProfileSetup';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ProfileFormFieldsProps {
  age: string;
  setAge: (age: string) => void;
  gender: string;
  setGender: (gender: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  interests: string[];
  currentInterest: string;
  setCurrentInterest: (interest: string) => void;
  handleAddInterest: () => void;
  handleRemoveInterest: (interest: string) => void;
  isLoading: boolean;
  isOver18: boolean;
  setIsOver18: (isOver18: boolean) => void;
}

const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
  age,
  setAge,
  gender,
  setGender,
  bio,
  setBio,
  interests,
  currentInterest,
  setCurrentInterest,
  handleAddInterest,
  handleRemoveInterest,
  isLoading,
  isOver18,
  setIsOver18
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="age" className="text-sm font-medium">
            Age (Optional)
          </label>
          <Input
            id="age"
            type="number"
            placeholder="Your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={18}
            max={120}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="gender" className="text-sm font-medium">
            Gender
          </label>
          <Select value={gender} onValueChange={setGender} required>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-Binary</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <InterestSelector 
        interests={interests}
        currentInterest={currentInterest}
        setCurrentInterest={setCurrentInterest}
        handleAddInterest={handleAddInterest}
        handleRemoveInterest={handleRemoveInterest}
        availableInterests={INTERESTS}
      />

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <Textarea
          id="bio"
          placeholder="Tell potential friends about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
          className="min-h-[100px]"
        />
      </div>

      <div className="flex items-center space-x-2 my-4">
        <Checkbox 
          id="ageConfirmation" 
          checked={isOver18} 
          onCheckedChange={(checked) => setIsOver18(checked === true)}
        />
        <Label 
          htmlFor="ageConfirmation" 
          className="text-sm font-medium cursor-pointer"
        >
          I confirm that I am 18 years or older
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving Profile..." : "Complete Profile"}
      </Button>
    </>
  );
};

export default ProfileFormFields;
