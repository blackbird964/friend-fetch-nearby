
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { LogOut, Edit, Camera, ShieldCheck, Bell, BellOff } from 'lucide-react';
import { signOut } from '@/lib/supabase';
import EditProfileForm from './EditProfileForm';
import ProfilePictureUpload from './ProfilePictureUpload';
import UserAvatar from '../users/cards/UserAvatar';
import { Link } from 'react-router-dom';
import { Separator } from "@/components/ui/separator";
import PriorityDisplay from './active-priorities/PriorityDisplay';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// List of authorized admin emails
const ADMIN_EMAILS = ['harp.dylan@gmail.com', 'aaron.stathi@gmail.com'];

const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser, setIsAuthenticated, updateUserProfile } = useAppContext();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPictureUpload, setShowPictureUpload] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  // Check if current user is an admin
  const isAdmin = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email);

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

  const handleEmailNotificationToggle = async (enabled: boolean) => {
    if (!currentUser) return;

    setIsUpdatingNotifications(true);
    try {
      await updateUserProfile({
        id: currentUser.id,
        email_notifications_enabled: enabled
      });

      setCurrentUser({
        ...currentUser,
        email_notifications_enabled: enabled
      });

      toast({
        title: enabled ? "Email notifications enabled" : "Email notifications disabled",
        description: enabled 
          ? "You will receive email notifications for meetup requests" 
          : "You will no longer receive email notifications",
      });
    } catch (error: any) {
      toast({
        title: "Error updating notification settings",
        description: error.message || "Failed to update notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  if (!currentUser) return null;

  if (isEditing) {
    return (
      <div className="space-y-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <EditProfileForm onCancel={() => setIsEditing(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const hasActivePriorities = currentUser.active_priorities && currentUser.active_priorities.length > 0;

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
              {currentUser.age && (
                <span>{currentUser.age}</span>
              )}
              {currentUser.age && currentUser.gender && (
                <span className="mx-2">•</span>
              )}
              {currentUser.gender && (
                <span className="capitalize">{currentUser.gender}</span>
              )}
            </div>
            
            <p className="text-gray-600 text-center mt-4 max-w-md">
              {currentUser.bio || "No bio provided yet."}
            </p>
            
            {hasActivePriorities ? (
              <div className="w-full mt-6">
                <h3 className="text-sm font-medium text-center mb-3">Current Priorities</h3>
                <div className="space-y-3 max-w-md mx-auto">
                  {currentUser.active_priorities.map((priority) => (
                    <PriorityDisplay key={priority.id} priority={priority} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {currentUser.interests && currentUser.interests.length > 0 ? (
                  <>
                    <h3 className="w-full text-sm font-medium text-center text-gray-500 mb-2">Interests</h3>
                    {currentUser.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </>
                ) : (
                  <span className="text-gray-500 text-sm">No interests or priorities added yet.</span>
                )}
              </div>
            )}
            
            <Separator className="my-6" />
            
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="flex items-center text-amber-600 border-amber-600 hover:bg-amber-50" 
                  asChild
                >
                  <Link to="/admin">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              )}
              
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
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <p>{currentUser.email}</p>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Notification Preferences</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {currentUser.email_notifications_enabled !== false ? (
                  <Bell className="h-4 w-4 text-blue-600" />
                ) : (
                  <BellOff className="h-4 w-4 text-gray-400" />
                )}
                <Label htmlFor="email-notifications" className="text-sm">
                  Email notifications for meetup requests
                </Label>
              </div>
              <Switch
                id="email-notifications"
                checked={currentUser.email_notifications_enabled !== false}
                onCheckedChange={handleEmailNotificationToggle}
                disabled={isUpdatingNotifications}
              />
            </div>
            <p className="text-xs text-gray-500">
              {currentUser.email_notifications_enabled !== false 
                ? "You will receive email notifications when someone sends you a meetup request"
                : "Email notifications are disabled. You won't receive emails for meetup requests"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
