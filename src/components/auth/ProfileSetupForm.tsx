
import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import ProfileFormContainer from './profile/ProfileFormContainer';
import ProfileFormFields from './profile/ProfileFormFields';
import { useProfileSetup } from '@/hooks/useProfileSetup';

const ProfileSetupForm: React.FC = () => {
  const { supabaseUser } = useAppContext();
  const {
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
  } = useProfileSetup();

  // Debug auth state
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Current session in ProfileSetupForm:", data.session);
    };
    
    checkSession();
    console.log("ProfileSetupForm user state:", { supabaseUser });
  }, [supabaseUser]);

  return (
    <ProfileFormContainer>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ProfileFormFields
          age={age}
          setAge={setAge}
          gender={gender}
          setGender={setGender}
          bio={bio}
          setBio={setBio}
          interests={interests}
          currentInterest={currentInterest}
          setCurrentInterest={setCurrentInterest}
          handleAddInterest={handleAddInterest}
          handleRemoveInterest={handleRemoveInterest}
          isLoading={isLoading}
          isOver18={isOver18}
          setIsOver18={setIsOver18}
        />
      </form>
    </ProfileFormContainer>
  );
};

export default ProfileSetupForm;
