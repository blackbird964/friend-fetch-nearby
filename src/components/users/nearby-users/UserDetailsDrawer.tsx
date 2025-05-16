
import React from 'react';
import { AppUser } from '@/context/types';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import UserAvatar from '../cards/UserAvatar';
import { Badge } from "@/components/ui/badge";
import { MessageCircle, UserPlus, Ban, Flag } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserDetailsDrawerProps {
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (user: AppUser) => void;
  onStartChat: (user: AppUser) => void;
}

const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({ 
  user, 
  isOpen, 
  onClose,
  onAddFriend,
  onStartChat
}) => {
  const { currentUser, blockUser, unblockUser, reportUser } = useAppContext();
  const [showBlockDialog, setShowBlockDialog] = React.useState(false);
  const [showReportDialog, setShowReportDialog] = React.useState(false);
  
  if (!user || !currentUser) return null;

  // Don't show block/report options for your own profile
  const isSelf = currentUser.id === user.id;
  
  // Check if user is already blocked
  const isBlocked = currentUser.blockedUsers?.includes(user.id) || false;
  
  const handleBlockUser = async () => {
    if (user.id) {
      const action = isBlocked ? unblockUser : blockUser;
      await action(user.id);
      setShowBlockDialog(false);
    }
  };
  
  const handleReportUser = async () => {
    if (user.id) {
      // For now we'll just use a generic reason
      await reportUser(user.id, "Inappropriate behavior");
      setShowReportDialog(false);
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85vh] overflow-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">Profile Details</DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 pb-0">
            <div className="flex items-center gap-4 mb-4">
              <UserAvatar 
                src={user.profile_pic} 
                alt={user.name || 'User'} 
                size="xl" 
              />
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                {user.age && user.gender && (
                  <p className="text-gray-500">{user.age} • {user.gender}</p>
                )}
              </div>
            </div>
            
            {user.bio && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                <p className="text-base">{user.bio}</p>
              </div>
            )}
            
            {user.interests && user.interests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-1.5">
                  {user.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="flex-col gap-3 pt-2">
            <div className="flex gap-3 w-full">
              <Button 
                onClick={() => onStartChat(user)}
                variant="outline" 
                className="flex-1"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat
              </Button>
              <Button 
                onClick={() => onAddFriend(user)}
                className="flex-1"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Friend
              </Button>
            </div>
            
            {!isSelf && (
              <>
                <Separator className="my-2" />
                <div className="flex gap-3 w-full">
                  <Button 
                    onClick={() => setShowBlockDialog(true)} 
                    variant="outline"
                    className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    {isBlocked ? "Unblock" : "Block"}
                  </Button>
                  <Button 
                    onClick={() => setShowReportDialog(true)} 
                    variant="outline" 
                    className="flex-1 text-amber-600 border-amber-600 hover:bg-amber-600/10"
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                </div>
              </>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      {/* Block User Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBlocked ? "Unblock this user?" : "Block this user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBlocked 
                ? "You'll start seeing them in the app again."
                : "They will be removed from your views. You can unblock them later."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBlockUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBlocked ? "Unblock" : "Block"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Report User Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a report to our admins for review. 
              Abuse of this feature may result in account restrictions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReportUser}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserDetailsDrawer;
