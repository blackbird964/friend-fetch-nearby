
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Profile } from '@/lib/supabase/profiles/types';

interface BasicInfoFieldsProps {
  formData: Partial<Profile>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleInterestChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  formData,
  handleChange,
  handleInterestChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="name">Name</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Please contact admin to update your name.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="name"
          name="name"
          value={formData.name || ''}
          className="bg-gray-100"
          disabled
          readOnly
        />
      </div>
      
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          placeholder="Tell us about yourself"
          className="min-h-[120px]"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="age">Age</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Please contact admin to update your age.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="age"
            name="age"
            type="number"
            value={formData.age || ''}
            className="bg-gray-100"
            disabled
            readOnly
          />
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="gender">Gender</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Please contact admin to update your gender.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="gender"
            name="gender"
            value={formData.gender || ''}
            className="bg-gray-100 capitalize"
            disabled
            readOnly
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="interests">Interests (comma separated)</Label>
        <Input
          id="interests"
          name="interests"
          value={formData.interests?.join(', ') || ''}
          onChange={handleInterestChange}
          placeholder="hiking, reading, cooking, etc."
        />
        {formData.interests && formData.interests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.interests.map((interest, index) => (
              <span 
                key={index}
                className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoFields;
