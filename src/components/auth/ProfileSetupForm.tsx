
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { createOrUpdateProfile, supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // Debug auth state
  useEffect(() => {
    console.log("ProfileSetupForm auth state:", { supabaseUser });
    
    // Double-check authentication status
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Current session data:", data);
    };
    
    checkAuth();
  }, [supabaseUser]);

  // Populate form with existing data if available
  useEffect(() => {
    if (currentUser) {
      if (currentUser.age) setAge(currentUser.age.toString());
      if (currentUser.gender) setGender(currentUser.gender);
      if (currentUser.bio) setBio(currentUser.bio);
      if (currentUser.interests) setInterests(currentUser.interests);
    }
  }, [currentUser]);

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

    try {
      // Verify authentication and get current session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session || !sessionData.session.user) {
        throw new Error("You must be logged in to update your profile");
      }
      
      const user = sessionData.session.user;
      console.log("Authenticated user from session:", user);
      
      // Get user name from user metadata
      const userName = user.user_metadata?.name || '';
      
      // Prepare profile data with authenticated user id
      const profileData = {
        id: user.id,
        name: userName,
        age: parseInt(age) || null,
        gender,
        bio,
        interests,
      };

      console.log("Creating or updating profile with data:", profileData);
      const { data, error } = await createOrUpdateProfile(profileData);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log("Profile updated successfully:", data);
        // Create a properly formatted user object
        const updatedUser = {
          id: data.id,
          name: data.name || '',
          bio: data.bio || '',
          age: data.age || null,
          gender: data.gender || '',
          interests: data.interests || [],
          profile_pic: data.profile_pic || null,
          email: user.email || '',
          location: currentUser?.location
        };
        
        setCurrentUser(updatedUser);

        toast({
          title: "Profile updated!",
          description: "Your profile has been successfully created",
        });
        
        // Navigate to home after successful profile setup
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
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
