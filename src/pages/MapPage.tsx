
import React from 'react';
import FriendMap from '@/components/map/FriendMap';

const MapPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 mb-20 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Find Friends Nearby</h1>
      <div className="h-[calc(100vh-200px)]">
        <FriendMap />
      </div>
    </div>
  );
};

export default MapPage;
