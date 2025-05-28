
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { createOrUpdateProfile, supabase } from '@/lib/supabase';

export const INTERESTS = [
  'Art', 'Books', 'Cooking', 'Fitness', 'Gaming', 'Hiking', 
  'Movies', 'Music', 'Photography', 'Sports', 'Technology', 
  'Travel', 'Writing', 'Yoga', 'Dancing', 'Fashion'
];

export const useProfileSetup = () => {
  const { currentUser, supabaseUser, setCurrentUser } = useAppContext();
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Populate form with existing data if available
  useEffect(() => {
    if (currentUser) {
      if (currentUser.age) setAge(currentUser.age.toString());
      if (currentUser.gender) setGender(currentUser.gender);
      if (currentUser.bio) setBio(currentUser.bio);
      if (currentUser.interests && Array.isArray(currentUser.interests)) {
        setInterests(currentUser.interests);
      }
      // Initialize isOver18 from user profile if available
      setIsOver18(currentUser.is_over_18 || false);
    }
  }, [currentUser]);

  const handleAddInterest = () => {
    if (currentInterest && !interests.includes(currentInterest)) {
      setInterests(prevInterests => [...prevInterests, currentInterest]);
      setCurrentInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that user confirmed they are over 18
    if (!isOver18) {
      toast({
        title: "Age confirmation required",
        description: "You must confirm that you are over 18 years old to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Get the current session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session || !sessionData.session.user) {
        // Attempt to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error("Session refresh error:", refreshError);
          throw new Error("Authentication required. Please log in again.");
        }
        
        console.log("Refreshed session:", refreshData.session);
      }
      
      // Get the latest session after potential refresh
      const { data: latestSession } = await supabase.auth.getSession();
      if (!latestSession.session || !latestSession.session.user) {
        throw new Error("Unable to authenticate. Please log in again.");
      }
      
      // Use the authenticated user from the session
      const user = latestSession.session.user;
      console.log("Using user for profile update:", user);
      
      // Prepare profile data
      const profileData = {
        id: user.id,
        name: user.user_metadata?.name || '',
        age: age ? parseInt(age) : null,
        gender,
        bio,
        interests: interests.length > 0 ? interests : [], // Ensure interests is an array
        is_over_18: isOver18, // Save the is_over_18 status to the database
      };

      console.log("Creating or updating profile with data:", profileData);
      const { data, error } = await createOrUpdateProfile(profileData);
      
      if (error) {
        console.error("Profile update error:", error);
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
          interests: Array.isArray(data.interests) ? data.interests : [],
          profile_pic: data.profile_pic || null,
          email: user.email || '',
          location: currentUser?.location,
          is_over_18: data.is_over_18 || false, // Include is_over_18 in user object
          isOnline: true, // Add the missing isOnline property
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

  return {
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
    handleSubmit,
    isLoading,
    isOver18,
    setIsOver18,
  };
};
