
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { updateProfile } from '@/lib/supabase';

const INTERESTS = [
  'Art', 'Books', 'Cooking', 'Fitness', 'Gaming', 'Hiking', 
  'Movies', 'Music', 'Photography', 'Sports', 'Technology', 
  'Travel', 'Writing', 'Yoga', 'Dancing', 'Fashion'
];

const ProfileSetupForm: React.FC = () => {
  const { currentUser, supabaseUser, setCurrentUser } = useAppContext();
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddInterest = () => {
    if (currentInterest && !interests.includes(currentInterest)) {
      setInterests([...interests, currentInterest]);
      setCurrentInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!supabaseUser) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const profileData = {
        id: supabaseUser.id,
        age: parseInt(age) || null,
        gender,
        bio,
        interests,
      };

      const { data, error } = await updateProfile(profileData);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Create a properly formatted AppUser object
        const updatedUser = {
          ...currentUser!,
          id: data.id,
          name: data.name || '',
          bio: data.bio || '',
          age: data.age || null,
          gender: data.gender || '',
          interests: data.interests || [],
          profile_pic: data.profile_pic || null,
          email: currentUser?.email || '',
          // Only add the location property if it exists in the data
          ...(data.location ? {
            location: {
              lat: typeof data.location === 'object' ? (data.location as any).lat || 0 : 0,
              lng: typeof data.location === 'object' ? (data.location as any).lng || 0 : 0
            }
          } : {})
        };
        
        setCurrentUser(updatedUser);

        toast({
          title: "Profile updated!",
          description: "Your profile has been successfully created",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
        <CardDescription className="text-center">
          Tell us about yourself to help find the right friends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  {INTERESTS.map((interest) => (
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
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSetupForm;
