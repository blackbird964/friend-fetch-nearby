
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import InterestSelector from '../interests/InterestSelector';
import { INTERESTS } from '@/hooks/useProfileSetup';

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
  isLoading
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="age" className="text-sm font-medium">
            Age
          </label>
          <Input
            id="age"
            type="number"
            placeholder="Your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
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
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Non-Binary">Non-Binary</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving Profile..." : "Complete Profile"}
      </Button>
    </>
  );
};

export default ProfileFormFields;
