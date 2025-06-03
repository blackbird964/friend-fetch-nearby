
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/lib/supabase/profiles/types';
import BasicInfoFields from './form-sections/BasicInfoFields';
import FormActions from './form-sections/FormActions';

// Define props interface for the component
interface EditProfileFormProps {
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onCancel }) => {
  const { currentUser, updateUserProfile } = useAppContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({
    bio: '',
    interests: [],
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        id: currentUser.id,
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        age: currentUser.age || null,
        gender: currentUser.gender?.toLowerCase() || '',
        interests: currentUser.interests || [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!currentUser?.id) {
        throw new Error('User ID is missing');
      }
      
      // Prepare profile data for update
      const updatedProfile: Partial<Profile> = {
        id: currentUser.id,
        name: formData.name,
        bio: formData.bio,
        age: formData.age,
        gender: formData.gender,
        interests: formData.interests,
      };
      
      console.log("Submitting profile update:", updatedProfile);
      
      await updateUserProfile(updatedProfile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      // Call the onCancel function to exit edit mode after successful update
      onCancel();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message || "There was a problem updating your profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <BasicInfoFields
          formData={formData}
          handleChange={handleChange}
          handleInterestChange={handleInterestChange}
        />
      </div>
      
      <FormActions loading={loading} onCancel={onCancel} />
    </form>
  );
};

export default EditProfileForm;
