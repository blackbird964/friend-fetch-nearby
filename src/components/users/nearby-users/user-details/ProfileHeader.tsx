
import React from 'react';
import { AppUser } from '@/context/types';
import UserAvatar from '../../cards/UserAvatar';

interface ProfileHeaderProps {
  user: AppUser;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
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
  );
};

export default ProfileHeader;
