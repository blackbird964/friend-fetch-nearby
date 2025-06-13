
import React from 'react';
import { AppUser } from '@/context/types';
import { useChatActions } from '@/components/users/hooks/useChatActions';
import UserItem from '@/components/users/nearby-users/UserItem';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface MobileDrawerContainerProps {
  nearbyUsers: AppUser[];
  currentUser: AppUser | null;
  radiusInKm: number;
  onUserSelect: (user: AppUser) => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onCloseDrawer: () => void;
}

const MobileDrawerContainer: React.FC<MobileDrawerContainerProps> = ({
  nearbyUsers,
  currentUser,
  radiusInKm,
  onUserSelect,
  isDrawerOpen,
  onCloseDrawer
}) => {
  const { startChat } = useChatActions();

  const handleStartChat = async (user: AppUser) => {
    console.log("[MobileDrawerContainer] Starting chat with user:", user.name);
    try {
      await startChat(user);
      onCloseDrawer(); // Close the drawer after starting chat
    } catch (error) {
      console.error("[MobileDrawerContainer] Error starting chat:", error);
    }
  };

  const filteredUsers = nearbyUsers.filter(user => 
    currentUser && user.id !== currentUser.id
  );

  return (
    <Drawer open={isDrawerOpen} onOpenChange={(open) => !open && onCloseDrawer()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle>Nearby Users ({filteredUsers.length})</DrawerTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseDrawer}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>
        
        <div className="px-4 pb-8 space-y-4 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No users found within {radiusInKm}km</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                onStartChat={handleStartChat}
                onSelect={onUserSelect}
              />
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawerContainer;
