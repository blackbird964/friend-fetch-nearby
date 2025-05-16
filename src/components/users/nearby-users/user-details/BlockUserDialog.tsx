
import React from 'react';
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

interface BlockUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isBlocked: boolean;
  onBlockUser: () => void;
}

const BlockUserDialog: React.FC<BlockUserDialogProps> = ({
  isOpen,
  onOpenChange,
  isBlocked,
  onBlockUser
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
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
            onClick={onBlockUser}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isBlocked ? "Unblock" : "Block"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BlockUserDialog;
