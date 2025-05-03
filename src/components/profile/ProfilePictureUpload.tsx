
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Image } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { checkAndCreateProfilesBucket } from '@/lib/supabase/storage';

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  onUploadComplete?: (url: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ 
  currentImageUrl,
  onUploadComplete
}) => {
  const { currentUser, updateUserProfile } = useAppContext();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!currentUser?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to upload a profile picture",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      // Check if we can access the bucket
      const bucketAccessible = await checkAndCreateProfilesBucket();
      
      if (!bucketAccessible) {
        toast({
          title: "Storage Error",
          description: "Could not access the storage bucket. Please try again later.",
          variant: "destructive"
        });
        return;
      }

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Uploading file to path:', filePath);

      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase
        .storage
        .from('profiles')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('profiles')
        .getPublicUrl(filePath);

      console.log('File uploaded successfully, public URL:', publicUrl);

      // Update the user's profile with the new profile picture URL
      await updateUserProfile(currentUser.id, { profile_pic: publicUrl });

      // Call the callback with the new URL if provided
      if (onUploadComplete) {
        onUploadComplete(publicUrl);
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });

    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading your profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    captureInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-4 mb-4">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={triggerFileInput}
          disabled={uploading}
          className="flex items-center"
        >
          <Upload className="mr-2 h-4 w-4" />
          Choose File
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={triggerCameraInput}
          disabled={uploading}
          className="flex items-center"
        >
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
      </div>
      
      {uploading && (
        <p className="text-sm text-gray-500">Uploading...</p>
      )}
      
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <input
        ref={captureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePictureUpload;
