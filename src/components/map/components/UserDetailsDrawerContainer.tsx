
import React from 'react';
import { AppUser } from '@/context/types';
import UserDetailsDrawer from '@/components/users/nearby-users/UserDetailsDrawer';

interface UserDetailsDrawerContainerProps {
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsDrawerContainer: React.FC<UserDetailsDrawerContainerProps> = ({
  user,
  isOpen,
  onClose
}) => {
  console.log("[UserDetailsDrawerContainer] Props received:", {
    user: user?.name,
    isOpen
  });

  return (
    <UserDetailsDrawer
      user={user}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default UserDetailsDrawerContainer;
