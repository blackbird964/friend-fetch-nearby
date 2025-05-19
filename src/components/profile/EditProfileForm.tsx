
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Profile, ActivePriority } from '@/lib/supabase/profiles/types';
import { ActivePriorityForm } from './active-priorities';
import ProfileFormTabs from './form-tabs/ProfileFormTabs';
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
      
      // Prepare profile data for update
      const updatedProfile: Partial<Profile> = {
        id: currentUser.id,
        bio: formData.bio,
        interests: formData.interests,
        active_priorities: formData.active_priorities,
      };
      
      // Ensure active_priorities is included and formatted correctly
      if (!updatedProfile.active_priorities) {
        updatedProfile.active_priorities = [];
      }
      
      console.log("Submitting profile update with active priorities:", updatedProfile.active_priorities);
      
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
      <ProfileFormTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        basicInfoContent={
          <BasicInfoFields
            formData={formData}
            handleChange={handleChange}
            handleInterestChange={handleInterestChange}
          />
        }
        prioritiesContent={
          <ActivePriorityForm
            priorities={formData.active_priorities || []}
            onAddPriority={handleAddPriority}
            onRemovePriority={handleRemovePriority}
          />
        }
      />
      
      <FormActions loading={loading} onCancel={onCancel} />
    </form>
  );
};

export default EditProfileForm;
