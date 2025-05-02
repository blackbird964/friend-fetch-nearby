
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Edit, Camera } from 'lucide-react';
import { signOut } from '@/lib/supabase';
import EditProfileForm from './EditProfileForm';
import ProfilePictureUpload from './ProfilePictureUpload';
import UserAvatar from '../users/cards/UserAvatar';

const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser, setIsAuthenticated } = useAppContext();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPictureUpload, setShowPictureUpload] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message || "An error occurred while logging out",
        variant: "destructive",
      });
      console.error('Error logging out:', error);
    }
  };

  const handleProfilePicUpdate = (url: string) => {
    if (currentUser) {
      // Update the local user state with new profile pic
      setCurrentUser({
        ...currentUser,
        profile_pic: url
      });
    }
    setShowPictureUpload(false);
  };

  if (!currentUser) return null;

  if (isEditing) {
    return (
      <EditProfileForm onCancel={() => setIsEditing(false)} />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden shadow-md">
        <div className="h-32 bg-gradient-to-r from-primary to-purple-500"></div>
        
        <CardContent className="-mt-16 relative">
          <div className="flex flex-col items-center">
            <div className="relative">
              <UserAvatar 
                src={currentUser.profile_pic} 
                alt={currentUser.name}
                size="lg"
              />
              
              <button 
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md"
                onClick={() => setShowPictureUpload(!showPictureUpload)}
                aria-label="Update profile picture"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            {showPictureUpload && (
              <div className="mt-4 w-full max-w-xs">
                <ProfilePictureUpload 
                  currentImageUrl={currentUser.profile_pic}
                  onUploadComplete={handleProfilePicUpdate}
                />
              </div>
            )}
            
            <h2 className="text-2xl font-bold mt-4">{currentUser.name}</h2>
            
            <div className="flex items-center mt-1 text-gray-500 text-sm">
              <span>{currentUser.age} years</span>
              {currentUser.gender && (
                <>
                  <span className="mx-2">•</span>
                  <span>{currentUser.gender}</span>
                </>
              )}
            </div>
            
            <p className="text-gray-600 text-center mt-4 max-w-md">
              {currentUser.bio || "No bio provided yet."}
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {currentUser.interests && currentUser.interests.length > 0 ? (
                currentUser.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No interests added yet.</span>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button 
                variant="destructive" 
                className="flex items-center" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <p>{currentUser.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
