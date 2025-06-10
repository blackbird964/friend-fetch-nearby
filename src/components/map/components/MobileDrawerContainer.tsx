
import React from 'react';
import { AppUser } from '@/context/types';
import { MobileDrawer, DrawerHandle } from './mobile-drawer';
import { MapSidePanel } from './side-panel';

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
  onToggleDrawer,
  onCloseDrawer
}) => {
  // Filter online users for count
  const onlineUsers = nearbyUsers.filter(user => 
    user.id !== currentUser?.id && 
    user.isOnline === true &&
    user.id && 
    !String(user.id).includes('test') && 
    !String(user.id).includes('mock')
  );

  console.log('[MobileDrawerContainer] Online users count:', onlineUsers.length);
  console.log('[MobileDrawerContainer] Drawer state - isOpen:', isDrawerOpen);

  // Create side panel content
  const sidePanelContent = (
    <MapSidePanel
      users={nearbyUsers}
      currentUser={currentUser}
      radiusInKm={radiusInKm}
      onUserSelect={onUserSelect}
    />
  );

  return (
    <>
      <DrawerHandle 
        onClick={onToggleDrawer}
        userCount={onlineUsers.length}
      />
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={onCloseDrawer}
      >
        {sidePanelContent}
      </MobileDrawer>
    </>
  );
};

export default MobileDrawerContainer;
