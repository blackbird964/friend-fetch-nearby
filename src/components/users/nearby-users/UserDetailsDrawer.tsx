
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
import UserBasicInfo from '../cards/UserBasicInfo';
import UserInterests from '../cards/UserInterests';
import { MessageCircle, UserPlus } from 'lucide-react';

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
  if (!user) return null;

  return (
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
              <UserInterests interests={user.interests} />
            </div>
          )}
        </div>

        <DrawerFooter className="flex-row gap-3 pt-2">
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default UserDetailsDrawer;
