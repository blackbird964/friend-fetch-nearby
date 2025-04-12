
import React from 'react';
import ProfilePage from '@/components/profile/ProfilePage';

const Profile: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 mb-20 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <ProfilePage />
    </div>
  );
};

export default Profile;
