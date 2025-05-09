
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define props interface for the component
interface EditProfileFormProps {
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onCancel }) => {
  const { currentUser, updateUserProfile } = useAppContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({
    name: '',
    bio: '',
    age: null,
    gender: '',
    interests: [],
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
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
    
    if (name === 'age') {
      const ageValue = value ? parseInt(value, 10) : null;
      setFormData(prev => ({ ...prev, [name]: ageValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
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
      
      // Prepare profile data for update without location
      let updatedProfile: Partial<Profile> = {
        ...formData,
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
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
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
            <Label htmlFor="age">Age (Optional)</Label>
            <Input
              id="age"
              name="age"
              type="number"
              min="18"
              max="120"
              value={formData.age || ''}
              onChange={handleChange}
              placeholder="Your age"
            />
          </div>
          
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender || ''}
              onValueChange={(value) => handleSelectChange('gender', value)}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select gender</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
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
