
import React from 'react';

interface ProfileBioProps {
  bio: string | undefined;
}

const ProfileBio: React.FC<ProfileBioProps> = ({ bio }) => {
  if (!bio) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
      <p className="text-base">{bio}</p>
    </div>
  );
};

export default ProfileBio;
