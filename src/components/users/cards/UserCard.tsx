
import React from 'react';
import { AppUser } from '@/context/types';
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from './UserAvatar';
import UserBasicInfo from './UserBasicInfo';
import UserInterests from './UserInterests';
import UserContextMenu from '../UserContextMenu';

interface UserCardProps {
  user: AppUser;
  minimal?: boolean;
  onClick?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, minimal = false, onClick }) => {
  return (
    <UserContextMenu user={user}>
      <Card 
        className={`${onClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${minimal ? '' : 'shadow-md'}`}
        onClick={onClick}
      >
        <CardContent className={`${minimal ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center space-x-3">
            <UserAvatar 
              src={user.profile_pic} 
              alt={user.name || 'User'} 
              size={minimal ? 'sm' : 'md'} 
            />
            <div className="flex-1">
              <UserBasicInfo 
                name={user.name}
                age={user.age}
                gender={user.gender}
                bio={user.bio}
                minimal={minimal}
              />
              
              {!minimal && user.interests && (
                <UserInterests interests={user.interests} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </UserContextMenu>
  );
};

export default UserCard;
