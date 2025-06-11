
import React, { useState } from 'react';
import { AppUser } from '@/context/types';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from "@/components/ui/drawer";
import { useAppContext } from '@/context/AppContext';
import {
  ProfileHeader,
  ProfileBio,
  ProfileInterests,
  ProfileActions,
  ModerationActions,
  BlockUserDialog,
  ReportUserDialog
} from './user-details';
import ActivePriorities from './user-details/ActivePriorities';

interface UserDetailsDrawerProps {
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (user: AppUser) => void;
}

const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({ 
  user, 
  isOpen, 
  onClose,
  onStartChat
}) => {
  const { currentUser, blockUser, unblockUser, reportUser } = useAppContext();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  
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
  
  const handleReportUser = async (reason: string) => {
    if (user.id) {
      await reportUser(user.id, reason);
      setShowReportDialog(false);
    }
  };

  const handleStartChat = () => {
    console.log("[UserDetailsDrawer] Starting chat with user:", user.name);
    onStartChat(user);
    onClose(); // Close the drawer after starting chat
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85vh] overflow-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">Profile Details</DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 pb-0">
            <ProfileHeader user={user} />
            <ProfileBio bio={user.bio} />
            
            {/* Show active priorities first if they exist */}
            <ActivePriorities priorities={user.active_priorities} />
            
            {/* Legacy interests as fallback */}
            {(!user.active_priorities || user.active_priorities.length === 0) && (
              <ProfileInterests interests={user.interests} />
            )}
          </div>

          <DrawerFooter className="flex-col gap-3 pt-2">
            <ProfileActions 
              user={user}
              onStartChat={handleStartChat}
            />
            
            <ModerationActions 
              isBlocked={isBlocked}
              onBlock={() => setShowBlockDialog(true)}
              onReport={() => setShowReportDialog(true)}
              show={!isSelf}
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      <BlockUserDialog 
        isOpen={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        isBlocked={isBlocked}
        onBlockUser={handleBlockUser}
      />
      
      <ReportUserDialog 
        isOpen={showReportDialog}
        onOpenChange={setShowReportDialog}
        onReportUser={handleReportUser}
      />
    </>
  );
};

export default UserDetailsDrawer;
