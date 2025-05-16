
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Profile, ActivePriority } from '@/lib/supabase/profiles/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import ActivePriorityForm from './ActivePriorityForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define props interface for the component
interface EditProfileFormProps {
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onCancel }) => {
  const { currentUser, updateUserProfile } = useAppContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [formData, setFormData] = useState<Partial<Profile>>({
    bio: '',
    interests: [],
    active_priorities: [],
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        age: currentUser.age || null,
        gender: currentUser.gender?.toLowerCase() || '',
        interests: currentUser.interests || [],
        active_priorities: currentUser.active_priorities || [],
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const interests = value.split(',').map(interest => interest.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, interests }));
  };

  const handleAddPriority = (priority: ActivePriority) => {
    setFormData(prev => ({
      ...prev,
      active_priorities: [...(prev.active_priorities || []), priority]
    }));
  };

  const handleRemovePriority = (priorityId: string) => {
    setFormData(prev => ({
      ...prev,
      active_priorities: (prev.active_priorities || []).filter(p => p.id !== priorityId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!currentUser?.id) {
        throw new Error('User ID is missing');
      }
      
      // Prepare profile data for update without location
      let updatedProfile: Partial<Profile> = {
        bio: formData.bio,
        interests: formData.interests,
        active_priorities: formData.active_priorities,
        id: currentUser.id,
      };
      
      // Remove location from the update payload to avoid format errors
      delete updatedProfile.location;
      
      console.log("Submitting profile update:", updatedProfile);
      
      await updateUserProfile(currentUser.id, updatedProfile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      // Call the onCancel function to exit edit mode after successful update
      onCancel();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="priorities">Active Priorities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 mt-4">
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
              value={formData.name}
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
        </TabsContent>
        
        <TabsContent value="priorities" className="mt-4">
          <ActivePriorityForm
            priorities={formData.active_priorities || []}
            onAddPriority={handleAddPriority}
            onRemovePriority={handleRemovePriority}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex space-x-3">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditProfileForm;
