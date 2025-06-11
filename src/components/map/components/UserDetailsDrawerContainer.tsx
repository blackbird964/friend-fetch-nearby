
import React from 'react';
import { AppUser } from '@/context/types';
import UserDetailsDrawer from '@/components/users/nearby-users/UserDetailsDrawer';

interface UserDetailsDrawerContainerProps {
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (user: AppUser) => void;
}

const UserDetailsDrawerContainer: React.FC<UserDetailsDrawerContainerProps> = ({
  user,
  isOpen,
  onClose,
  onStartChat
}) => {
  console.log("[UserDetailsDrawerContainer] Props received:", {
    user: user?.name,
    isOpen,
    onStartChat: !!onStartChat
  });

  return (
    <UserDetailsDrawer
      user={user}
      isOpen={isOpen}
      onClose={onClose}
      onStartChat={onStartChat}
    />
  );
};

export default UserDetailsDrawerContainer;
