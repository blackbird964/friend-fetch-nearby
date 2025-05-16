
import React, { useState } from 'react';
import { Ban, AlertTriangle } from 'lucide-react';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from "@/components/ui/context-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from '@/context/AppContext';
import { AppUser } from '@/context/types';
import { Label } from '@/components/ui/label';

interface UserContextMenuProps {
  user: AppUser;
  children: React.ReactNode;
}

const REPORT_REASONS = [
  "Inappropriate behavior",
  "Harassment",
  "Spam messages",
  "Fake profile",
  "Offensive content",
  "Other"
];

const UserContextMenu: React.FC<UserContextMenuProps> = ({ user, children }) => {
  const { currentUser, blockUser, unblockUser, reportUser } = useAppContext();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  
  // Don't show block/report options for your own profile
  if (currentUser?.id === user.id) {
    return <>{children}</>;
  }
  
  // Check if user is already blocked
  const isBlocked = currentUser?.blockedUsers?.includes(user.id) || false;
  
  const handleBlockUser = async () => {
    if (user.id) {
      const action = isBlocked ? unblockUser : blockUser;
      await action(user.id);
      setShowBlockDialog(false);
    }
  };
  
  const handleReportUser = async () => {
    if (user.id) {
      await reportUser(user.id, reportReason);
      setShowReportDialog(false);
    }
  };
  
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem 
            className="text-destructive flex items-center cursor-pointer"
            onClick={() => setShowBlockDialog(true)}
          >
            <Ban className="mr-2 h-4 w-4" />
            {isBlocked ? "Unblock user" : "Block user"}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-amber-600 flex items-center cursor-pointer"
            onClick={() => setShowReportDialog(true)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Report user
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
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
              Please select a reason for reporting this user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="report-reason" className="text-sm font-medium mb-2 block">
              Reason for report
            </Label>
            <Select 
              value={reportReason} 
              onValueChange={setReportReason}
            >
              <SelectTrigger id="report-reason" className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReportUser}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserContextMenu;
