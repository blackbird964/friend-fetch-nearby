
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { createOrUpdateProfile } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const INTERESTS = [
  'Art', 'Books', 'Cooking', 'Fitness', 'Gaming', 'Hiking', 
  'Movies', 'Music', 'Photography', 'Sports', 'Technology', 
  'Travel', 'Writing', 'Yoga', 'Dancing', 'Fashion'
];

type FormValues = {
  name: string;
  age: string;
  gender: string;
  bio: string;
};

interface EditProfileFormProps {
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onCancel }) => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [interests, setInterests] = useState<string[]>(currentUser?.interests || []);
  const [currentInterest, setCurrentInterest] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    defaultValues: {
      name: currentUser?.name || '',
      age: currentUser?.age?.toString() || '',
      gender: currentUser?.gender || '',
      bio: currentUser?.bio || '',
    },
  });

  const handleAddInterest = () => {
    if (currentInterest && !interests.includes(currentInterest)) {
      setInterests([...interests, currentInterest]);
      setCurrentInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const onSubmit = async (values: FormValues) => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
      const profileData = {
        id: currentUser.id,
        name: values.name,
        age: parseInt(values.age) || null,
        gender: values.gender,
        bio: values.bio,
        interests,
      };

      const { data, error } = await createOrUpdateProfile(profileData);
      
      if (error) throw error;
      
      if (data) {
        setCurrentUser({
          ...currentUser,
          ...data,
        });
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
        
        onCancel();
      }
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input {...form.register('name')} placeholder="Your name" disabled={isLoading} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Age</label>
              <Input
                type="number"
                {...form.register('age')}
                placeholder="Your age"
                min={18}
                max={120}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <Select
                value={form.getValues('gender')}
                onValueChange={(value) => form.setValue('gender', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              {...form.register('bio')}
              placeholder="Tell others about yourself..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Interests</label>
            <div className="flex space-x-2">
              <Select
                value={currentInterest}
                onValueChange={setCurrentInterest}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interests" />
                </SelectTrigger>
                <SelectContent>
                  {INTERESTS.map((interest) => (
                    <SelectItem key={interest} value={interest}>
                      {interest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddInterest}
                disabled={!currentInterest || isLoading}
              >
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
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm;
